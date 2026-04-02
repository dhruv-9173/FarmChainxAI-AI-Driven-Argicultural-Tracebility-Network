package infosys.project.farmchainxai.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Ensures historical schemas can store base64 crop images.
 * Hibernate update mode does not always widen existing varchar columns.
 */
@Component
@Slf4j
public class SchemaCompatibilityFix {

    private final JdbcTemplate jdbcTemplate;

    public SchemaCompatibilityFix(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void ensureCropImageColumnType() {
        try {
            jdbcTemplate.execute("ALTER TABLE batches MODIFY COLUMN crop_image_url LONGTEXT NULL");
            log.info("Schema compatibility check: batches.crop_image_url set to LONGTEXT");
        } catch (Exception ex) {
            log.warn("Schema compatibility check skipped or failed: {}", ex.getMessage());
        }
    }
}
