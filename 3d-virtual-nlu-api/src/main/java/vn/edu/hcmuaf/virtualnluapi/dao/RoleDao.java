package vn.edu.hcmuaf.virtualnluapi.dao;

import jakarta.enterprise.context.ApplicationScoped;
import vn.edu.hcmuaf.virtualnluapi.connection.HikariCP;
import vn.edu.hcmuaf.virtualnluapi.entity.Role;

import java.util.Optional;
@ApplicationScoped
public class RoleDao {
    public Role getRoleByName(String roleName) {
        Optional<Role> role = HikariCP.getJdbi().withHandle(handle ->
                handle.createQuery("SELECT * FROM roles WHERE name = ?")
                        .bind(0, roleName).mapToBean(Role.class).stream().findFirst()

        );
        return role.orElse(null);
    }

    public Role getRoleById(int id) {
        Optional<Role> role = HikariCP.getJdbi().withHandle(handle ->
                handle.createQuery("SELECT * FROM roles WHERE id = ?")
                        .bind(0, id).mapToBean(Role.class).stream().findFirst()

        );
        return role.orElse(null);
    }

}
