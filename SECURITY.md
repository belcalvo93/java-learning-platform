# Security Policy — JavaMaster

## 1. Compromiso de Seguridad

En **JavaMaster**, la seguridad de los usuarios, del código educativo y de la infraestructura es un pilar esencial. La plataforma adopta un enfoque preventivo basado en:

- **HTTPS obligatorio**: Todas las conexiones viajan cifradas con TLS.
- **Cero secretos en código cliente**: El repositorio no contiene credenciales privadas, tokens de administración ni claves de API con permisos de escritura no restringidos.
- **Aislamiento en Cloud Firestore**: Mediante reglas de seguridad (`firestore.rules`), los documentos de usuario (`users/{userId}`) son estrictamente accesibles solo por su titular verificado (`request.auth.uid == userId`). Las colecciones administrativas no permiten escritura desde clientes web.
- **Gestión de contraseñas**: Delegada en Firebase Authentication, utilizando algoritmos criptográficos robustos (Bcrypt/Scrypt).
- **Entorno de ejecución y validación**: Las soluciones de ejercicios se validan localmente en el navegador mediante reglas deterministas seguras y análisis estructural.

---

## 2. Reporte Responsable de Vulnerabilidades

Si descubrís una vulnerabilidad de seguridad o un vector de ataque potencial en este repositorio o en la plataforma desplegada, te solicitamos actuar de manera responsable:

1. **Contacto**: Envía un correo a `CONTACTO_PENDIENTE` con el asunto `[SECURITY] Reporte de Vulnerabilidad en JavaMaster`.
2. **Detalles**: Incluí una descripción clara del problema, pasos de reproducción, impacto estimado y pruebas de concepto (PoC) si corresponde.
3. **Confidencialidad**: Te pedimos no divulgar públicamente la vulnerabilidad hasta que haya sido analizada y subsanada por el equipo.

Nos comprometemos a acusar recibo en un plazo razonable, priorizar la mitigación del hallazgo y notificar a los usuarios si algún incidente hubiera afectado la privacidad de sus datos.
