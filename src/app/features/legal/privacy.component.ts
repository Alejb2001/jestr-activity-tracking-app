import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container py-5" style="max-width:780px">
      <h2 class="fw-bold mb-1">Pol&iacute;tica de Privacidad</h2>
      <p class="text-muted mb-5" style="font-size:14px">Última actualización: agosto de 2026</p>

      <h5 class="fw-bold mt-4">1. Datos que recopilamos</h5>
      <p>Al usar el Servicio, recopilamos los siguientes tipos de datos:</p>
      <ul>
        <li><strong>Datos de cuenta:</strong> nombre, correo electrónico, nombre de usuario y empresa.</li>
        <li><strong>Datos de uso:</strong> actividades registradas, estados, fechas y responsables asignados.</li>
        <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y registros de acceso al sistema.</li>
      </ul>

      <h5 class="fw-bold mt-4">2. Cómo usamos los datos</h5>
      <p>Los datos recopilados se utilizan exclusivamente para:</p>
      <ul>
        <li>Proveer y mejorar las funcionalidades del Servicio.</li>
        <li>Gestionar las cuentas de usuario y la autenticación.</li>
        <li>Enviar comunicaciones relacionadas con el Servicio (actualizaciones, alertas de seguridad).</li>
        <li>Cumplir con obligaciones legales aplicables.</li>
      </ul>

      <h5 class="fw-bold mt-4">3. Compartición de datos</h5>
      <p>Jestr no vende, alquila ni comparte los datos personales de sus usuarios con terceros, salvo en los siguientes casos:</p>
      <ul>
        <li>Proveedores de servicios técnicos necesarios para operar el Servicio (ej. infraestructura en la nube), quienes están sujetos a acuerdos de confidencialidad.</li>
        <li>Requerimientos legales o regulatorios de autoridades competentes.</li>
      </ul>

      <h5 class="fw-bold mt-4">4. Seguridad</h5>
      <p>Implementamos medidas técnicas y organizativas razonables para proteger los datos personales contra acceso no autorizado, pérdida o destrucción, incluyendo cifrado de contraseñas (PBKDF2) y comunicaciones mediante HTTPS.</p>

      <h5 class="fw-bold mt-4">5. Retención de datos</h5>
      <p>Los datos se conservan mientras la cuenta del Cliente esté activa o según sea necesario para cumplir con obligaciones legales. Al cancelar el Servicio, los datos pueden ser eliminados dentro de los 90 días siguientes, salvo que se acuerde otro plazo por escrito.</p>

      <h5 class="fw-bold mt-4">6. Derechos del usuario</h5>
      <p>De acuerdo con la legislación aplicable, los usuarios pueden ejercer los siguientes derechos sobre sus datos personales: acceso, rectificación, supresión, oposición y portabilidad. Para ejercerlos, contacta a tu administrador de empresa o escríbenos directamente.</p>

      <h5 class="fw-bold mt-4">7. Cookies</h5>
      <p>El Servicio puede utilizar almacenamiento local del navegador (localStorage) para mantener la sesión activa. No utilizamos cookies de rastreo de terceros ni publicidad.</p>

      <h5 class="fw-bold mt-4">8. Contacto</h5>
      <p>Para cualquier consulta sobre esta Política de Privacidad, escríbenos a <a href="mailto:hola@jestr.app">hola&#64;jestr.app</a>.</p>
    </div>
  `
})
export class PrivacyComponent {}
