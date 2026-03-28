package infosys.project.farmchainxai.service;


import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class QrCodeService {

    @Value("${farmchain.batch.trace-url:https://trace.farmchain.ai/batch}")
    private String batchTraceBaseUrl;

    public QrCodeResult generateBatchQrCode(String batchId) {
        String traceUrl = batchTraceBaseUrl + "/" + batchId;

        try {
            String base64Image = generateQrCodeBase64(traceUrl, 300, 300);
            return new QrCodeResult(traceUrl, "data:image/png;base64," + base64Image);
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code for batch: " + batchId, e);
        }
    }

    private String generateQrCodeBase64(String content, int width, int height)
            throws WriterException, IOException {

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H); // High error correction
        hints.put(EncodeHintType.MARGIN, 1); // Quiet zone
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        QRCodeWriter qrWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
    }

    /**
     * Holds both the URL that the QR code encodes and the Base64 image string.
     */
    public record QrCodeResult(String traceUrl, String base64Image) {}
}