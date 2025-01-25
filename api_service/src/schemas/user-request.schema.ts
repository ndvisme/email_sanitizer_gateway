import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserRequest extends Document {
  @Prop({ required: true })
  originalPrompt: string;

  @Prop()
  sanitizedPrompt: string;

  @Prop()
  llmResponse: string;

  @Prop()
  sanitizedResponse: string;

  @Prop([String])
  promptMaskedEmails: string[];

  @Prop([String])
  responseMaskedEmails: string[];
}

export const UserRequestSchema = SchemaFactory.createForClass(UserRequest);
