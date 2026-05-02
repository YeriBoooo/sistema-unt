import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async generarReportePracticas(filtros: any): Promise<Buffer> {
    const whereClause: any = {};
    
    if (filtros.fecha_inicio?.gte) {
      whereClause.created_at = {
        gte: filtros.fecha_inicio.gte,
      };
    }
    if (filtros.fecha_fin?.lte) {
      whereClause.created_at = {
        ...whereClause.created_at,
        lte: filtros.fecha_fin.lte,
      };
    }

    const data = await this.prisma.postulacion.findMany({
      where: whereClause,
      include: {
        estudiante: {
          include: {
            usuario: true,
            escuela: true,
          },
        },
        oferta: {
          include: {
            empresa: true,
          },
        },
        seguimiento: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const html = this.generarHtmlPracticas(data);
    
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true 
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    
    // ✅ Convertir Uint8Array a Buffer
    return Buffer.from(pdf);
  }

  async generarReporteTesis(filtros: any): Promise<Buffer> {
    const whereClause: any = {};
    
    if (filtros.fecha_inicio?.gte) {
      whereClause.created_at = {
        gte: filtros.fecha_inicio.gte,
      };
    }
    if (filtros.fecha_fin?.lte) {
      whereClause.created_at = {
        ...whereClause.created_at,
        lte: filtros.fecha_fin.lte,
      };
    }

    const data = await this.prisma.tesis.findMany({
      where: whereClause,
      include: {
        estudiante: {
          include: {
            usuario: true,
            escuela: true,
          },
        },
        asesor_principal: {
          include: { usuario: true },
        },
        jurados: {
          include: { asesor: { include: { usuario: true } } },
        },
        avances: true,
        acta: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const html = this.generarHtmlTesis(data);
    
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true 
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    
    // ✅ Convertir Uint8Array a Buffer
    return Buffer.from(pdf);
  }

  async generarReporteConvenios(filtros: any): Promise<Buffer> {
    const whereClause: any = {};
    
    if (filtros.fecha_inicio?.gte) {
      whereClause.created_at = {
        gte: filtros.fecha_inicio.gte,
      };
    }
    if (filtros.fecha_fin?.lte) {
      whereClause.created_at = {
        ...whereClause.created_at,
        lte: filtros.fecha_fin.lte,
      };
    }

    const data = await this.prisma.convenio.findMany({
      where: whereClause,
      include: {
        empresa: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const html = this.generarHtmlConvenios(data);
    
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true 
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    
    // ✅ Convertir Uint8Array a Buffer
    return Buffer.from(pdf);
  }

  private generarHtmlPracticas(data: any[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Prácticas Preprofesionales</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1e3a8a; text-align: center; }
          h2 { color: #2563eb; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #2563eb; color: white; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Reporte de Prácticas Preprofesionales</h1>
        <p>Fecha de generación: ${new Date().toLocaleString()}</p>
        
        <h2>Resumen de Postulaciones</h2>
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Empresa</th>
              <th>Práctica</th>
              <th>Fecha Postulación</th>
              <th>Estado</th>
              <th>Horas Cumplidas</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(p => `
              <tr>
                <td>${p.estudiante?.usuario?.nombres || '-'} ${p.estudiante?.usuario?.apellidos || '-'}</td>
                <td>${p.oferta?.empresa?.razon_social || '-'}</td>
                <td>${p.oferta?.titulo || '-'}</td>
                <td>${new Date(p.fecha_postulacion).toLocaleDateString()}</td>
                <td>${p.estado}</td>
                <td>${p.seguimiento?.horas_cumplidas || 0} / ${p.seguimiento?.horas_totales || 300}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Sistema UNT - Gestión de Prácticas y Tesis</p>
        </div>
      </body>
      </html>
    `;
  }

  private generarHtmlTesis(data: any[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Tesis</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1e3a8a; text-align: center; }
          h2 { color: #2563eb; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #2563eb; color: white; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Reporte de Tesis</h1>
        <p>Fecha de generación: ${new Date().toLocaleString()}</p>
        
        <h2>Listado de Tesis</h2>
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Título</th>
              <th>Asesor Principal</th>
              <th>Estado</th>
              <th>Fecha Inicio</th>
              <th>Avances</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(t => `
              <tr>
                <td>${t.estudiante?.usuario?.nombres || '-'} ${t.estudiante?.usuario?.apellidos || '-'}</td>
                <td>${t.titulo || '-'}</td>
                <td>${t.asesor_principal?.usuario?.nombres || '-'} ${t.asesor_principal?.usuario?.apellidos || '-'}</td>
                <td>${t.estado}</td>
                <td>${t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleDateString() : '-'}</td>
                <td>${t.avances?.length || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Sistema UNT - Gestión de Prácticas y Tesis</p>
        </div>
      </body>
      </html>
    `;
  }

  private generarHtmlConvenios(data: any[]): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Convenios</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #1e3a8a; text-align: center; }
          h2 { color: #2563eb; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #2563eb; color: white; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Reporte de Convenios</h1>
        <p>Fecha de generación: ${new Date().toLocaleString()}</p>
        
        <h2>Listado de Convenios</h2>
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Tipo</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(c => `
              <tr>
                <td>${c.empresa?.razon_social || '-'}</td>
                <td>${c.tipo || '-'}</td>
                <td>${new Date(c.fecha_inicio).toLocaleDateString()}</td>
                <td>${new Date(c.fecha_fin).toLocaleDateString()}</td>
                <td>${c.estado || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Sistema UNT - Gestión de Prácticas y Tesis</p>
        </div>
      </body>
      </html>
    `;
  }
}