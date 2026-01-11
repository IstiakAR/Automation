use lettre::{
    message::{header, Mailbox, Message, MultiPart, SinglePart},
    transport::smtp::authentication::Credentials,
    SmtpTransport, Transport,
};
use std::fs;

/// Send email with optional multiple attachments
pub fn send_email_with_attachments(
    smtp_email: String,
    smtp_password: String,
    to: String,
    subject: String,
    body: String,
    attachment_paths: Vec<String>,
) -> Result<(), String> {

    // -----------------------------
    // Email body (text)
    // -----------------------------
    let mut multipart = MultiPart::mixed()
        .singlepart(SinglePart::plain(body));

    // -----------------------------
    // Attachments (0..n)
    // -----------------------------
    for raw_path in attachment_paths {
        // 🧹 CLEAN PATH
        // Handles:
        //  D:\a.pdf
        //  [D:\a.pdf]
        //  [D:\a.pdf;D:\b.png]  (split already done earlier)
        let path = raw_path
            .trim()
            .trim_start_matches('[')
            .trim_end_matches(']')
            .to_string();

        if path.is_empty() {
            continue;
        }

        let filename = std::path::Path::new(&path)
            .file_name()
            .and_then(|n| n.to_str())
            .ok_or(format!("Invalid attachment filename: {}", path))?
            .to_string();

        let bytes = fs::read(&path)
            .map_err(|e| format!("Failed to read attachment {}: {}", path, e))?;

        let attachment = SinglePart::builder()
            .header(
                header::ContentType::parse("application/octet-stream")
                    .map_err(|e| e.to_string())?,
            )
            .header(header::ContentDisposition::attachment(&filename))
            .body(bytes);

        multipart = multipart.singlepart(attachment);
    }

    // -----------------------------
    // Build email
    // -----------------------------
    let email = Message::builder()
        .from(
            smtp_email
                .parse::<Mailbox>()
                .map_err(|e| e.to_string())?,
        )
        .to(
            to.parse::<Mailbox>()
                .map_err(|e| e.to_string())?,
        )
        .subject(subject)
        .multipart(multipart)
        .map_err(|e| e.to_string())?;

    // -----------------------------
    // SMTP transport (Gmail)
    // -----------------------------
    let creds = Credentials::new(smtp_email.clone(), smtp_password);

    let mailer = SmtpTransport::relay("smtp.gmail.com")
        .map_err(|e| e.to_string())?
        .credentials(creds)
        .build();

    mailer.send(&email).map_err(|e| e.to_string())?;

    Ok(())
}
