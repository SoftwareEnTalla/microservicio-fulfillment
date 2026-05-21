/*
 * Copyright (c) 2026 SoftwarEnTalla
 * Licencia: MIT
 * Contacto: softwarentalla@gmail.com
 * CEOs: 
 *       Persy Morell Guerra      Email: pmorellpersi@gmail.com  Phone : +53-5336-4654 Linkedin: https://www.linkedin.com/in/persy-morell-guerra-288943357/
 *       Dailyn García Domínguez  Email: dailyngd@gmail.com      Phone : +53-5432-0312 Linkedin: https://www.linkedin.com/in/dailyn-dominguez-3150799b/
 *
 * CTO: Persy Morell Guerra
 * COO: Dailyn García Domínguez and Persy Morell Guerra
 * CFO: Dailyn García Domínguez and Persy Morell Guerra
 *
 * Repositories: 
 *               https://github.com/SoftwareEnTalla 
 *
 *               https://github.com/apokaliptolesamale?tab=repositories
 *
 *
 * Social Networks:
 *
 *              https://x.com/SoftwarEnTalla
 *
 *              https://www.facebook.com/profile.php?id=61572625716568
 *
 *              https://www.instagram.com/softwarentalla/
 *              
 *
 *
 */

import { InputType, Field, Float, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  ValidateNested,
} from 'class-validator';




@InputType()
export class BaseFulfillmentDto {
  @ApiProperty({
    type: () => String,
    description: 'Nombre de instancia CreateFulfillment',
    example: 'Nombre de instancia CreateFulfillment',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  name: string = '';

  // Propiedades predeterminadas de la clase CreateFulfillmentDto según especificación del sistema

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de creación de la instancia (CreateFulfillment).',
    example: 'Fecha de creación de la instancia (CreateFulfillment).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  creationDate: Date = new Date(); // Fecha de creación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => Date,
    description: 'Fecha de actualización de la instancia (CreateFulfillment).',
    example: 'Fecha de actualización de la instancia (CreateFulfillment).',
    nullable: false,
  })
  @IsDate()
  @IsNotEmpty()
  @Field(() => Date, { nullable: false })
  modificationDate: Date = new Date(); // Fecha de modificación por defecto, con precisión hasta milisegundos

  @ApiProperty({
    type: () => String,
    description:
      'Usuario que realiza la creación de la instancia (CreateFulfillment).',
    example:
      'Usuario que realiza la creación de la instancia (CreateFulfillment).',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  createdBy?: string; // Usuario que crea el objeto

  @ApiProperty({
    type: () => Boolean,
    description: 'Estado de activación de la instancia (CreateFulfillment).',
    example: 'Estado de activación de la instancia (CreateFulfillment).',
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean, { nullable: false })
  isActive: boolean = false; // Por defecto, el objeto no está activo

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código de la orden de fulfillment',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código de la orden de fulfillment', nullable: false })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Orden comercial asociada',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Orden comercial asociada', nullable: false })
  orderId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Almacén operativo',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Almacén operativo', nullable: false })
  warehouseId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Wave asignada',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Wave asignada', nullable: true })
  waveId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado global del fulfillment',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado global del fulfillment', nullable: false })
  status!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado de picking',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado de picking', nullable: false })
  pickingStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado de packing',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado de packing', nullable: false })
  packingStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Operador asignado',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Operador asignado', nullable: true })
  assignedOperatorId?: string;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Momento en que queda listo para despacho',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Momento en que queda listo para despacho', nullable: true })
  dispatchReadyAt?: Date = new Date();

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos', nullable: true })
  metadata?: Record<string, any> = {};

  // Constructor
  constructor(partial: Partial<BaseFulfillmentDto>) {
    Object.assign(this, partial);
  }
}




@InputType()
export class FulfillmentDto extends BaseFulfillmentDto {
  // Propiedades específicas de la clase FulfillmentDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<FulfillmentDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<FulfillmentDto>): FulfillmentDto {
    const instance = new FulfillmentDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 




@InputType()
export class FulfillmentValueInput {
  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Campo de filtro',
  })
  @Field({ nullable: false })
  fieldName: string = 'id';

  @ApiProperty({
    type: () => FulfillmentDto,
    nullable: false,
    description: 'Valor del filtro',
  })
  @Field(() => FulfillmentDto, { nullable: false })
  fieldValue: any; // Permite cualquier tipo
} 




@ObjectType()
export class FulfillmentOutPutDto extends BaseFulfillmentDto {
  // Propiedades específicas de la clase FulfillmentOutPutDto en cuestión

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Identificador único de la instancia',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<FulfillmentOutPutDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<FulfillmentOutPutDto>): FulfillmentOutPutDto {
    const instance = new FulfillmentOutPutDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateFulfillmentDto extends BaseFulfillmentDto {
  // Propiedades específicas de la clase CreateFulfillmentDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a crear',
    example:
      'Se proporciona un identificador de CreateFulfillment a crear \(opcional\) ',
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  // Constructor
  constructor(partial: Partial<CreateFulfillmentDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<CreateFulfillmentDto>): CreateFulfillmentDto {
    const instance = new CreateFulfillmentDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
}



@InputType()
export class CreateOrUpdateFulfillmentDto {
  @ApiProperty({
    type: () => String,
    description: 'Identificador',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  id?: string;

  @ApiProperty({
    type: () => CreateFulfillmentDto,
    description: 'Instancia CreateFulfillment o UpdateFulfillment',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Field(() => CreateFulfillmentDto, { nullable: true })
  input?: CreateFulfillmentDto | UpdateFulfillmentDto; // Asegúrate de que esto esté correcto
}



@InputType()
export class DeleteFulfillmentDto {
  // Propiedades específicas de la clase DeleteFulfillmentDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a eliminar',
    example: 'Se proporciona un identificador de DeleteFulfillment a eliminar',
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id: string = '';

  @ApiProperty({
    type: () => String,
    description: 'Lista de identificadores de instancias a eliminar',
    example:
      'Se proporciona una lista de identificadores de DeleteFulfillment a eliminar',
    default: [],
  })
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  ids?: string[];
}



@InputType()
export class UpdateFulfillmentDto extends BaseFulfillmentDto {
  // Propiedades específicas de la clase UpdateFulfillmentDto en cuestión

  @ApiProperty({
    type: () => String,
    description: 'Identificador de instancia a actualizar',
    example: 'Se proporciona un identificador de UpdateFulfillment a actualizar',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  id!: string;

  // Constructor
  constructor(partial: Partial<UpdateFulfillmentDto>) {
    super(partial);
    Object.assign(this, partial);
  }

  // Método estático para construir la instancia
  static build(data: Partial<UpdateFulfillmentDto>): UpdateFulfillmentDto {
    const instance = new UpdateFulfillmentDto(data);
    instance.creationDate = new Date(); // Actualiza la fecha de creación al momento de la creación
    instance.modificationDate = new Date(); // Actualiza la fecha de modificación al momento de la creación
    return instance;
  }
} 



