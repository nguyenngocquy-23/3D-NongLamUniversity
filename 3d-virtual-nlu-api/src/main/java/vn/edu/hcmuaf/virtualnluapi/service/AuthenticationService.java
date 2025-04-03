package vn.edu.hcmuaf.virtualnluapi.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import vn.edu.hcmuaf.virtualnluapi.config.JwtProperties;
import vn.edu.hcmuaf.virtualnluapi.dao.EmailVerificationDao;
import vn.edu.hcmuaf.virtualnluapi.dao.RoleDao;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserLoginRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.request.UserRegisterRequest;
import vn.edu.hcmuaf.virtualnluapi.dto.response.LoginResponse;
import vn.edu.hcmuaf.virtualnluapi.entity.InvalidatedToken;
import vn.edu.hcmuaf.virtualnluapi.entity.User;
import vn.edu.hcmuaf.virtualnluapi.utils.EncryptUtil;

import java.sql.Timestamp;
import java.text.ParseException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

@Slf4j
@ApplicationScoped
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class AuthenticationService {
    @Inject
    UserDao userDao;
    @Inject
    EmailVerificationDao emailVerifyDAO;
    @Inject
    RoleDao roleDao;
    @Inject
    InvalidatedTokenService invalidatedTokenService;

    protected long enableDuration = JwtProperties.enableDuration;
    protected long refreshDuration = JwtProperties.refreshDuration;
    protected String SIGN_KEY = JwtProperties.signerKey;

    public boolean authenticate(String requestToken) {
        boolean result = true;
        try {
            verifyToken(requestToken, false);
        } catch (Exception e) {
            result = false;
            log.warn("Token be logouted");
        }
        return result;
    }

    public SignedJWT verifyToken(String token, boolean isRefresh) {
        try {
            JWSVerifier jwsVerifier = new MACVerifier(SIGN_KEY.getBytes());
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!signedJWT.verify(jwsVerifier)) {
                log.error("Invalid token signature");
                throw new RuntimeException("Invalid token signature");
            }
            Date expirationTime = (isRefresh)
                    ? new Date(signedJWT.getJWTClaimsSet().getIssueTime().toInstant().plus(Duration.ofSeconds(refreshDuration)).toEpochMilli())
                    : signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expirationTime.before(new Date())) {
                log.error("Token is expired");
                throw new RuntimeException("Token is expired");
            }
            if (invalidatedTokenService.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
                throw new RuntimeException("Token is invalidated");
            }
            return signedJWT;
        } catch (ParseException e) {
            log.error("Invalid token format", e);
            throw new RuntimeException("Invalid token format", e);
        } catch (JOSEException e) {
            log.error("Error verifying token signature", e);
            throw new RuntimeException("Error verifying token signature", e);
        }
    }

    public LoginResponse refreshToken(String token) throws ParseException {
        var signToken = verifyToken(token, true);
        var username = signToken.getJWTClaimsSet().getSubject();
        var user = userDao.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("Username not found");
        }
        return new LoginResponse().builder()
                .token(generateToken(user))
                .authenticated(true)
                .build();
    }

    public User signup(UserRegisterRequest userRegisterDTO) {
        // encrypt Password
        String encryptPassword = EncryptUtil.hashPassword(userRegisterDTO.getPassword());
        User user = User.builder()
                .username(userRegisterDTO.getUsername())
                .password(encryptPassword)
                .status((byte) 1)
                .email(userRegisterDTO.getEmail())
                .roleId(roleDao.getRoleByName("USER").getId())
                .createdAt(Timestamp.valueOf(LocalDateTime.now()))
                .build();
        //signup user
        if (!userDao.insert(user)) {
            return null;
        }
        return userDao.findByUsername(user.getUsername());
    }

    public LoginResponse login(UserLoginRequest userLoginDTO) {
        User user = userDao.findByUsername(userLoginDTO.getUsername());
        if (user == null) {
            throw new RuntimeException("Username not found");
        }
        if (user.getStatus() == 1) {
            throw new RuntimeException("Please active to login!");
        } else if (user.getStatus() == 0) {
            throw new RuntimeException("Account is locked");
        }

        var token = generateToken(user);
        if (EncryptUtil.checkPassword(userLoginDTO.getPassword(), user.getPassword())) {
            return new LoginResponse().builder()
                    .token(token)
                    .authenticated(true)
                    .build();
        } else {
            throw new RuntimeException("Password is incorrect");
        }
    }

    public void logout(String tokenRequest) throws ParseException {
        var signToken = verifyToken(tokenRequest, true);

        String jit = signToken.getJWTClaimsSet().getJWTID();
        Timestamp expiryTime = new Timestamp(signToken.getJWTClaimsSet().getExpirationTime().getTime());

        invalidatedTokenService.save(InvalidatedToken.builder()
                .id(jit)
                .expiredAt(expiryTime)
                .build());
    }

    public String generateToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issueTime(new Date())
                .expirationTime(Timestamp.from(Instant.now().plus(Duration.ofSeconds(enableDuration))))
                .issuer("localhost")
                .claim("scope", user.getRoleId()) // name of role (RoleDAO)
                .jwtID(UUID.randomUUID().toString())
                .build();
        SignedJWT signedJWT = new SignedJWT(jwsHeader, jwtClaimsSet);
        try {
            signedJWT.sign(new MACSigner(SIGN_KEY.getBytes()));
            return signedJWT.serialize();
        } catch (JOSEException e) {
            log.error("Error when generate token");
            throw new RuntimeException(e);
        }
    }
}