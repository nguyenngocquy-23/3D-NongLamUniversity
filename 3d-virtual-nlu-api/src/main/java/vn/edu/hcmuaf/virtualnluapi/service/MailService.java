package vn.edu.hcmuaf.virtualnluapi.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import vn.edu.hcmuaf.virtualnluapi.config.MailProperties;
import vn.edu.hcmuaf.virtualnluapi.dao.UserDao;
import vn.edu.hcmuaf.virtualnluapi.entity.EmailVerification;
import vn.edu.hcmuaf.virtualnluapi.entity.User;

import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@ApplicationScoped
public class MailService {
    /*
     * Mỗi khi gọi phương thức sendMail, một Runnable được gửi đến ExecutorService
     * để thực thi việc gửi email trên một thread riêng biệt. ExecutorService giúp
     * tạo và quản lý các thread để thực hiện công việc gửi email một cách bất
     * đồng bộ
     */
    @Inject
    UserDao userDAO;
    private ExecutorService executorService = Executors.newFixedThreadPool(3); // Số lượng thread tùy chọn

    public void sendMailResetPassword(User user, String newPassword) {
        String subject = "Thông báo: Mật khẩu đã được đổi thành công";
        StringBuilder content = new StringBuilder();
        content.append("<p>Xin ch&agrave;o <strong>").append(user.getUsername()).append("</strong>.</p>").append(
                        "<p>Ch&uacute;ng t&ocirc;i đến từ <strong>VirtualTour.NLU.edu.vn</strong>, xin th&ocirc;ng b&aacute;o rằng mật khẩu của bạn đ&atilde; được đổi th&agrave;nh c&ocirc;ng.</p>")
                .append("<p>Mật khẩu mới của bạn l&agrave;:<strong>").append(newPassword).append("</strong></p>")
                .append("<p>&nbsp;Vui l&ograve;ng đăng nhập bằng mật khẩu mới n&agrave;y để tiếp tục sử dụng t&agrave;i khoản.</p>")
                .append("<p>Vui l&ograve;ng nhấn v&agrave;o link b&ecirc;n dưới để đăng nhập bằng mật khẩu mới:</p>")
//                .append("<p><a href=\"").append(getBaseURL(request)).append("/dang-nhap\"><strong>Đăng nhập</strong></a></p>")
                .append("<p>Tr&acirc;n trọng, Đội ngũ quản trị vi&ecirc;n.</p>");
        sendMail(user.getEmail(), subject, content.toString());
    }

    public void sendMailVerifyUser(User user, EmailVerification verification) {
        String subject = "Thông báo: Đăng kí tài khoản thành công";
        StringBuilder content = new StringBuilder();
        content.append("<p>Chào bạn <strong>").append(user.getUsername()).append("</strong>,</p>")
                .append("<p>Bạn đã đăng ký tài khoản thành công tại <strong>VirtualTour.NLU.edu.vn</strong>.</p>")
                .append("<p>Để kích hoạt tài khoản, vui lòng sử dụng mã xác thực sau:</p>")
                .append("<h2 style='color:blue;'><strong>").append(verification.getToken()).append("</strong></h2>")
                .append("<p>Nhập mã này vào trang xác thực để hoàn tất quá trình đăng ký.</p>")
                .append("<p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>")
                .append("<p>Trân trọng,</p><p>Ban quản trị <strong>VirtualTour.NLU.edu.vn</strong>.</p>");
        sendMail(user.getEmail(), subject, content.toString());
    }

//    public void sendMailReplyContact(ReplyContact replyContact, ContactDTO contact) {
//        sendMail(contact.getEmail(), replyContact.getTitle(), replyContact.getContent());
//    }

//    public void sendMailToAdmin(String content) {
//        String subject = "Warning";
//        StringBuilder send = new StringBuilder();
//        send.append("<p>Cảnh báo từ hệ thống phát hiện: ").append(content).append("</p>");
//        for (var x : userDAO.getAllAdminEmail()) {
//            sendMail(x, subject, send.toString());
//        }
//    }

    public void sendNotificationToUser(User user, String content) {
        String subject = "Warning";
        StringBuilder send = new StringBuilder();
        send.append("<p>Thông báo từ hệ thống : ").append(content).append("</p>");
        sendMail(user.getEmail(), subject, send.toString());
    }

    private void sendMail(String to, String subject, String content) {
            Properties props = new Properties();
            props.put("mail.smtp.auth", String.valueOf(MailProperties.auth));
            props.put("mail.smtp.starttls.enable", String.valueOf(MailProperties.starttls));
            props.put("mail.smtp.host", MailProperties.host);
            props.put("mail.smtp.port", String.valueOf(MailProperties.port));

            Session session = Session.getInstance(props, new Authenticator() {
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(MailProperties.user, MailProperties.password);
                }
            });

            try {
                MimeMessage message = new MimeMessage(session);
                message.setFrom(new InternetAddress(MailProperties.user));
                message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
                message.setSubject(subject, "UTF-8");
                message.setContent(content, "text/html; charset=UTF-8");
                Transport.send(message);
            } catch (MessagingException e) {
                e.printStackTrace();
            }
    }
}
