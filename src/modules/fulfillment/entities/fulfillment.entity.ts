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

import { Column, Entity, OneToOne, JoinColumn, ChildEntity, ManyToOne, OneToMany, ManyToMany, JoinTable, Index, Check, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CreateFulfillmentDto, UpdateFulfillmentDto, DeleteFulfillmentDto } from '../dtos/all-dto';
import { IsArray, IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from 'graphql-type-json';
import { plainToInstance } from 'class-transformer';



@ChildEntity('fulfillment')
@ObjectType()
export class Fulfillment extends BaseEntity {
  @ApiProperty({
    type: String,
    nullable: false,
    description: "Nombre de la instancia de Fulfillment",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Nombre de la instancia de Fulfillment", nullable: false })
  @Column({ type: 'varchar', length: 100, nullable: false, comment: 'Este es un campo para nombrar la instancia Fulfillment' })
  private name!: string;

  @ApiProperty({
    type: String,
    description: "Descripción de la instancia de Fulfillment",
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: "Descripción de la instancia de Fulfillment", nullable: false })
  @Column({ type: 'varchar', length: 255, nullable: false, default: "Sin descripción", comment: 'Este es un campo para describir la instancia Fulfillment' })
  private description!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Código de la orden de fulfillment',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Código de la orden de fulfillment', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 80, unique: true, comment: 'Código de la orden de fulfillment' })
  code!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Orden comercial asociada',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Orden comercial asociada', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Orden comercial asociada' })
  orderId!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Almacén operativo',
  })
  @IsUUID()
  @IsNotEmpty()
  @Field(() => String, { description: 'Almacén operativo', nullable: false })
  @Column({ type: 'uuid', nullable: false, comment: 'Almacén operativo' })
  warehouseId!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Wave asignada',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Wave asignada', nullable: true })
  @Column({ type: 'uuid', nullable: true, comment: 'Wave asignada' })
  waveId?: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado global del fulfillment',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado global del fulfillment', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 40, comment: 'Estado global del fulfillment' })
  status!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado de picking',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado de picking', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 40, comment: 'Estado de picking' })
  pickingStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: false,
    description: 'Estado de packing',
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Estado de packing', nullable: false })
  @Column({ type: 'varchar', nullable: false, length: 40, comment: 'Estado de packing' })
  packingStatus!: string;

  @ApiProperty({
    type: () => String,
    nullable: true,
    description: 'Operador asignado',
  })
  @IsUUID()
  @IsOptional()
  @Field(() => String, { description: 'Operador asignado', nullable: true })
  @Column({ type: 'uuid', nullable: true, comment: 'Operador asignado' })
  assignedOperatorId?: string;

  @ApiProperty({
    type: () => Date,
    nullable: true,
    description: 'Momento en que queda listo para despacho',
  })
  @IsDate()
  @IsOptional()
  @Field(() => Date, { description: 'Momento en que queda listo para despacho', nullable: true })
  @Column({ type: 'timestamp', nullable: true, comment: 'Momento en que queda listo para despacho' })
  dispatchReadyAt?: Date = new Date();

  @ApiProperty({
    type: () => Object,
    nullable: true,
    description: 'Metadatos operativos',
  })
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { description: 'Metadatos operativos', nullable: true })
  @Column({ type: 'json', nullable: true, comment: 'Metadatos operativos' })
  metadata?: Record<string, any> = {};

  protected executeDslLifecycle(): void {
    // Rule: dispatch-ready-requires-pack-complete
    // No se puede dejar listo para despacho un fulfillment sin packing completo.
    if (!(this.packingStatus === 'PACKED')) {
      throw new Error('FULFILLMENT_001: El packing debe estar completo antes del despacho');
    }
  }

  // Relación con BaseEntity (opcional, si aplica)
  // @OneToOne(() => BaseEntity, { cascade: true })
  // @JoinColumn()
  // base!: BaseEntity;

  constructor() {
    super();
    this.type = 'fulfillment';
  }

  // Getters y Setters
  get getName(): string {
    return this.name;
  }
  set setName(value: string) {
    this.name = value;
  }
  get getDescription(): string {
    return this.description;
  }

  // Métodos abstractos implementados
  async create(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async update(data: any): Promise<BaseEntity> {
    Object.assign(this, data);
    this.executeDslLifecycle();
    this.modificationDate = new Date();
    return this;
  }
  async delete(id: string): Promise<BaseEntity> {
    this.id = id;
    return this;
  }

  // Método estático para convertir DTOs a entidad con sobrecarga
  static fromDto(dto: CreateFulfillmentDto): Fulfillment;
  static fromDto(dto: UpdateFulfillmentDto): Fulfillment;
  static fromDto(dto: DeleteFulfillmentDto): Fulfillment;
  static fromDto(dto: any): Fulfillment {
    // plainToInstance soporta todos los DTOs
    return plainToInstance(Fulfillment, dto);
  }
}
