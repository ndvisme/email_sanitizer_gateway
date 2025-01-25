import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRequest } from 'src/schemas/user-request.schema';
import { UserRequestField } from 'src/constants/user-request.constants';

@Injectable()
export class UserRequestService {
  constructor(@InjectModel(UserRequest.name) private userRequestModel: Model<UserRequest>) { }

  async create(prompt: string): Promise<UserRequest> {
    const newPrompt = new this.userRequestModel({ originalPrompt: prompt });
    return newPrompt.save();
  }

  async update(id: string, field: UserRequestField, value: string | string[]): Promise<UserRequest> {
    const updated = await this.userRequestModel.findByIdAndUpdate(
      id,
      { [field]: value },
      { new: true }
    );
    if (!updated) {
      throw new NotFoundException(`UserRequest with ID "${id}" not found`);
    }
    return updated;
  }
}
