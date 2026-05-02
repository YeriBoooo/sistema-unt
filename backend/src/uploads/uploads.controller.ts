import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { createReadStream } from 'fs';
import { existsSync } from 'fs';

@Controller('uploads')
export class UploadsController {
  @Get('avances/:filename')
  async getAvanceFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // ✅ Usar process.cwd() para obtener la raíz del proyecto
    const filePath = join(process.cwd(), 'uploads', 'avances', filename);
    
    console.log('📁 Buscando archivo:', filePath);
    console.log('📁 ¿Existe?', existsSync(filePath));
    
    if (existsSync(filePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      createReadStream(filePath).pipe(res);
    } else {
      res.status(404).json({ message: 'Archivo no encontrado', path: filePath });
    }
  }
}