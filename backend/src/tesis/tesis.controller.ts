import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TesisService } from './tesis.service';
import { AvancesService } from './avances.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tesis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TesisController {
  constructor(
    private readonly tesisService: TesisService,
    private readonly avancesService: AvancesService,
  ) {}

  @Get('mis-tesis')
  @Roles('estudiante')
  async misTesis(@CurrentUser() user: any) {
    const estudiante = await this.tesisService.getEstudianteByUsuarioId(user.id);
    return this.tesisService.findByEstudiante(estudiante.id);
  }

  @Get('mi-tesis')
  @Roles('estudiante')
  async miTesis(@CurrentUser() user: any) {
    const estudiante = await this.tesisService.getEstudianteByUsuarioId(user.id);
    const tesis = await this.tesisService.findByEstudiante(estudiante.id);
    if (tesis && tesis.length > 0) {
      return this.tesisService.findOne(tesis[0].id);
    }
    return [];
  }

  @Get('avances/:avanceId')
  @Roles('asesor', 'admin')
  async getAvanceById(@Param('avanceId') avanceId: string) {
    return this.avancesService.findOne(parseInt(avanceId));
  }

  @Patch('avances/:avanceId')
  @Roles('asesor', 'admin')
  async revisarAvance(@Param('avanceId') avanceId: string, @Body() revisarDto: any) {
    return this.avancesService.revisar(parseInt(avanceId), revisarDto);
  }

  @Get()
  @Roles('admin', 'coordinador', 'asesor')
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10', @CurrentUser() user: any) {
    if (user.roles?.includes('asesor')) {
      const asesor = await this.tesisService.getAsesorByUsuarioId(user.id);
      return this.tesisService.findByAsesor(asesor.id);
    }
    return this.tesisService.findAll(parseInt(page), parseInt(limit));
  }

  @Post()
  @Roles('estudiante')
  async create(@Body() createTesisDto: any, @CurrentUser() user: any) {
    const estudiante = await this.tesisService.getEstudianteByUsuarioId(user.id);
    return this.tesisService.create(estudiante.id, createTesisDto);
  }

  // Endpoint para subir archivo de avance
  @Post(':id/avances/upload')
  @Roles('estudiante')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avances',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `avance-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const ext = extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de archivo no permitido. Solo PDF, DOC, DOCX, TXT'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadAvance(
    @Param('id') tesisId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('descripcion') descripcion: string,
    @Body('tipo') tipo: string,
    @CurrentUser() user: any,
  ) {
    return this.avancesService.createWithFile(parseInt(tesisId), {
      tipo: tipo || 'informe',
      descripcion: descripcion,
      fecha_entrega: new Date(),
      archivo_url: `/uploads/avances/${file.filename}`,
    });
  }

  // ✅ Endpoint para registrar acta con archivo PDF
  @Post(':id/acta')
  @Roles('admin', 'coordinador')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/actas',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `acta-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (ext === '.pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async registrarActaConArchivo(
    @Param('id') tesisId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('fecha') fecha: string,
    @Body('lugar') lugar: string,
    @Body('nota_final') nota_final: string,
    @CurrentUser() user: any,
  ) {
    const actaDto = {
      fecha,
      lugar,
      nota_final: parseFloat(nota_final),
    };
    return this.tesisService.registrarActa(parseInt(tesisId), actaDto, file);
  }

  @Post(':id/jurados')
  @Roles('admin', 'coordinador')
  async asignarJurado(@Param('id') id: string, @Body() juradoDto: any) {
    return this.tesisService.asignarJurado(parseInt(id), juradoDto);
  }

  @Post(':id/avances')
  @Roles('estudiante')
  async createAvance(@Param('id') id: string, @Body() createAvanceDto: any) {
    return this.avancesService.create(parseInt(id), createAvanceDto);
  }

  @Get(':id')
  @Roles('admin', 'coordinador', 'asesor', 'estudiante')
  findOne(@Param('id') id: string) {
    return this.tesisService.findOne(parseInt(id));
  }

  @Get(':id/avances')
  @Roles('admin', 'coordinador', 'asesor', 'estudiante')
  async getAvances(@Param('id') id: string) {
    return this.avancesService.findByTesis(parseInt(id));
  }

  @Get(':id/acta')
  @Roles('admin', 'coordinador')
  async getActa(@Param('id') id: string) {
    return this.tesisService.getActa(parseInt(id));
  }

  @Patch(':id')
  @Roles('admin', 'coordinador', 'asesor')
  update(@Param('id') id: string, @Body() updateTesisDto: any) {
    return this.tesisService.update(parseInt(id), updateTesisDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.tesisService.remove(parseInt(id));
  }

  @Delete(':id/jurados/:juradoId')
  @Roles('admin', 'coordinador')
  async removerJurado(@Param('juradoId') juradoId: string) {
    return this.tesisService.removerJurado(parseInt(juradoId));
  }
}