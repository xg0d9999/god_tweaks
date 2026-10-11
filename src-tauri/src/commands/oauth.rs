use std::io::{Read, Write};
use std::net::TcpListener;
use std::time::{Duration, Instant};

const OAUTH_PORT: u16 = 28491;
const REDIRECT_URI_ENCODED: &str = "http%3A%2F%2F127.0.0.1%3A28491%2Fcallback";

/// Inicia el flujo OAuth oficial de Discord mediante un servidor loopback local
#[tauri::command]
pub async fn start_discord_oauth(client_id: String) -> Result<String, String> {
    let discord_auth_url = format!(
        "https://discord.com/oauth2/authorize?client_id={client_id}&response_type=token&scope=identify&redirect_uri={REDIRECT_URI_ENCODED}"
    );

    // Abrir el navegador predeterminado de Windows
    let _ = crate::utils::win32::run_hidden_powershell(&format!("Start-Process '{discord_auth_url}'"));

    // Iniciar listener TCP en localhost
    let listener = TcpListener::bind(format!("127.0.0.1:{OAUTH_PORT}"))
        .map_err(|e| format!("No se pudo iniciar el servidor local de autenticación: {e}"))?;

    listener
        .set_nonblocking(true)
        .map_err(|e| format!("Error en socket no bloqueante: {e}"))?;

    let start_time = Instant::now();
    let timeout = Duration::from_secs(120);

    let mut captured_token: Option<String> = None;

    while start_time.elapsed() < timeout {
        match listener.accept() {
            Ok((mut stream, _addr)) => {
                let mut buffer = [0u8; 4096];
                if let Ok(bytes_read) = stream.read(&mut buffer) {
                    let request = String::from_utf8_lossy(&buffer[..bytes_read]);

                    if request.starts_with("GET /callback") {
                        // Servir página HTML que extrae el hash del fragmento (#access_token=...)
                        let html = r#"<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>g0d suite - Autenticación</title></head>
<body style="background:#090a0f;color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="background:#11131a;border:1px solid #232733;border-radius:24px;padding:36px 44px;text-align:center;box-shadow:0 12px 50px rgba(0,0,0,0.7);max-width:380px;">
    <h2 style="margin:0 0 8px;font-size:22px;color:#5865F2;">✔ Discord Vinculado</h2>
    <p style="color:#8c93a0;margin:0 0 16px;font-size:13px;">Tu cuenta ha sido vinculada a <strong>g0d suite</strong> con éxito.</p>
    <p style="color:#585e6d;margin:0;font-size:11px;">Ya puedes cerrar esta pestaña y volver a la app.</p>
  </div>
  <script>
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    if (token) {
      fetch('/token?token=' + encodeURIComponent(token))
        .then(() => setTimeout(() => window.close(), 1200))
        .catch(() => {});
    }
  </script>
</body>
</html>"#;
                        let response = format!(
                            "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                            html.len(),
                            html
                        );
                        let _ = stream.write_all(response.as_bytes());
                        let _ = stream.flush();
                    } else if request.starts_with("GET /token") {
                        // Extraer el token de la query string
                        if let Some(query_start) = request.find("GET /token?") {
                            let line = &request[query_start + 11..];
                            if let Some(query_end) = line.find(' ') {
                                let query = &line[..query_end];
                                for part in query.split('&') {
                                    if let Some(val) = part.strip_prefix("token=") {
                                        captured_token = Some(val.to_string());
                                    }
                                }
                            }
                        }

                        let response = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\nOK";
                        let _ = stream.write_all(response.as_bytes());
                        let _ = stream.flush();

                        if captured_token.is_some() {
                            break;
                        }
                    }
                }
            }
            Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                tokio_sleep(Duration::from_millis(150)).await;
            }
            Err(_) => {
                tokio_sleep(Duration::from_millis(150)).await;
            }
        }
    }

    captured_token.ok_or_else(|| "Tiempo de espera agotado. No se recibió autorización de Discord.".to_string())
}

async fn tokio_sleep(dur: Duration) {
    std::thread::sleep(dur);
}
