import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container py-5" style="max-width:780px">
      <h2 class="fw-bold mb-1">T&eacute;rminos de Uso</h2>
      <p class="text-muted mb-5" style="font-size:14px">Última actualización: agosto de 2026</p>

      <h5 class="fw-bold mt-4">1. Objeto del servicio</h5>
      <p>Jestr Activity Tracker («el Servicio») es una plataforma de gestión de actividades y seguimiento de equipos de trabajo, ofrecida como software como servicio (SaaS) a empresas y organizaciones («el Cliente»). El uso del Servicio implica la aceptación plena de estos Términos de Uso.</p>

      <h5 class="fw-bold mt-4">2. Registro y cuentas</h5>
      <p>El acceso al Servicio requiere la creación de una cuenta autorizada por el administrador de la empresa contratante. Cada usuario es responsable de mantener la confidencialidad de sus credenciales. Está prohibido compartir cuentas entre distintas personas.</p>

      <h5 class="fw-bold mt-4">3. Uso aceptable</h5>
      <p>El Cliente y sus usuarios se comprometen a utilizar el Servicio únicamente para fines lícitos y relacionados con la gestión interna de su organización. Queda expresamente prohibido:</p>
      <ul>
        <li>Intentar acceder a datos de otras empresas o cuentas ajenas.</li>
        <li>Realizar ingeniería inversa, descompilar o modificar el software.</li>
        <li>Usar el Servicio para actividades ilegales o fraudulentas.</li>
        <li>Introducir virus, malware o código malicioso de cualquier tipo.</li>
      </ul>

      <h5 class="fw-bold mt-4">4. Propiedad intelectual</h5>
      <p>Todos los derechos de propiedad intelectual sobre el Servicio, incluyendo su código fuente, diseño y marca, pertenecen a Jestr. El uso del Servicio no otorga al Cliente ningún derecho de propiedad sobre el mismo. Los datos introducidos por el Cliente son de su exclusiva propiedad.</p>

      <h5 class="fw-bold mt-4">5. Disponibilidad y modificaciones</h5>
      <p>Jestr realizará sus mejores esfuerzos para mantener el Servicio disponible de forma continua, pero no garantiza una disponibilidad del 100%. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del Servicio con un aviso previo razonable.</p>

      <h5 class="fw-bold mt-4">6. Limitación de responsabilidad</h5>
      <p>En la máxima medida permitida por la ley aplicable, Jestr no será responsable de daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de uso del Servicio. La responsabilidad total de Jestr ante el Cliente no excederá el importe pagado por el Servicio en los últimos 3 meses.</p>

      <h5 class="fw-bold mt-4">7. Ley aplicable</h5>
      <p>Estos Términos se rigen por la legislación vigente en el país de constitución de Jestr. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de dicho territorio.</p>

      <h5 class="fw-bold mt-4">8. Contacto</h5>
      <p>Para cualquier consulta sobre estos Términos, puedes escribirnos a <a href="mailto:hola@jestr.app">hola&#64;jestr.app</a>.</p>
    </div>
  `
})
export class TermsComponent {}
