package com.golf.service;

import com.golf.model.User;
import com.golf.model.Winner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${mail.from:noreply@golfcharity.com}")
    private String mailFrom;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(User user) {
        if (!mailEnabled) { log.info("Email disabled — skipping welcome email to {}", user.getEmail()); return; }
        String subject = "Welcome to GolfCharity!";
        String body = """
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h1 style="color:#22c55e">Welcome, %s!</h1>
              <p>You've successfully joined the Golf Charity Subscription Platform.</p>
              <p>Here's what to do next:</p>
              <ol>
                <li>Subscribe to a plan to enter monthly draws</li>
                <li>Add your golf scores (1–45)</li>
                <li>Wait for the monthly draw results</li>
              </ol>
              <a href="%s/dashboard" style="background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
                Go to Dashboard
              </a>
              <p style="color:#6b7280;margin-top:24px;font-size:14px">Golf Charity — Play. Win. Give.</p>
            </div>
            """.formatted(user.getFullName(), frontendUrl);
        send(user.getEmail(), subject, body);
    }

    @Async
    public void sendDrawResultEmail(User user, int matchCount, BigDecimal prize, int[] drawNumbers) {
        if (!mailEnabled) { log.info("Email disabled — skipping draw result email to {}", user.getEmail()); return; }
        String tier = matchCount == 5 ? "JACKPOT" : matchCount + " Match";
        String subject = "You won in the GolfCharity Draw!";
        String numbersStr = java.util.Arrays.toString(drawNumbers).replace("[", "").replace("]", "");
        String body = """
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h1 style="color:#22c55e">Congratulations, %s!</h1>
              <p>You matched <strong>%d numbers</strong> in this month's draw!</p>
              <div style="background:#1f2937;border-radius:12px;padding:20px;margin:20px 0">
                <p style="color:#9ca3af;margin:0 0 8px">Draw Numbers</p>
                <p style="color:white;font-size:24px;font-weight:bold;margin:0">%s</p>
              </div>
              <div style="background:#14532d;border-radius:12px;padding:20px;margin:20px 0">
                <p style="color:#86efac;margin:0 0 8px">%s Prize</p>
                <p style="color:white;font-size:32px;font-weight:bold;margin:0">$%.2f</p>
              </div>
              <p>To claim your prize, please upload your proof of identity in your dashboard.</p>
              <a href="%s/dashboard" style="background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
                Upload Proof
              </a>
            </div>
            """.formatted(user.getFullName(), matchCount, numbersStr, tier, prize, frontendUrl);
        send(user.getEmail(), subject, body);
    }

    @Async
    public void sendWinnerApprovedEmail(Winner winner) {
        if (!mailEnabled) { log.info("Email disabled — skipping approval email to {}", winner.getUser().getEmail()); return; }
        String subject = "Your GolfCharity prize has been approved!";
        String body = """
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h1 style="color:#22c55e">Prize Approved!</h1>
              <p>Hi %s, your prize of <strong>$%.2f</strong> has been approved.</p>
              <p>Net amount after charity donation: <strong>$%.2f</strong></p>
              <p>Charity donation: <strong>$%.2f</strong> (%d%%)</p>
              <p>Payment will be processed shortly.</p>
              <a href="%s/dashboard" style="background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
                View Dashboard
              </a>
            </div>
            """.formatted(
                winner.getUser().getFullName(),
                winner.getPrizeAmount(),
                winner.getNetPrize() != null ? winner.getNetPrize() : winner.getPrizeAmount(),
                winner.getCharityDonation() != null ? winner.getCharityDonation() : BigDecimal.ZERO,
                winner.getUser().getDonationPercentage(),
                frontendUrl
            );
        send(winner.getUser().getEmail(), subject, body);
    }

    @Async
    public void sendPaymentConfirmationEmail(Winner winner) {
        if (!mailEnabled) { log.info("Email disabled — skipping payment email to {}", winner.getUser().getEmail()); return; }
        String subject = "GolfCharity prize payment confirmed!";
        String body = """
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h1 style="color:#22c55e">Payment Confirmed!</h1>
              <p>Hi %s, your prize payment of <strong>$%.2f</strong> has been processed.</p>
              <p>A donation of <strong>$%.2f</strong> has been made to <strong>%s</strong> on your behalf.</p>
              <p>Thank you for playing and giving!</p>
              <a href="%s/dashboard" style="background:#22c55e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
                View Dashboard
              </a>
            </div>
            """.formatted(
                winner.getUser().getFullName(),
                winner.getNetPrize() != null ? winner.getNetPrize() : winner.getPrizeAmount(),
                winner.getCharityDonation() != null ? winner.getCharityDonation() : BigDecimal.ZERO,
                winner.getUser().getCharity() != null ? winner.getUser().getCharity().getName() : "your chosen charity",
                frontendUrl
            );
        send(winner.getUser().getEmail(), subject, body);
    }

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
