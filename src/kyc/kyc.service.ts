import { Injectable } from '@nestjs/common';
import { AnchorService } from '../anchor/anchor.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { VerifyCustomerDto } from './dto/verify-customer.dto';

@Injectable()
export class KycService {
  constructor(private readonly anchor: AnchorService) {}

  async createCustomer(payload: CreateCustomerDto) {
    return this.anchor.createCustomer(payload);
  }

  async getCustomer(customerId: string) {
    return this.anchor.getCustomer(customerId);
  }

  async verifyCustomer(customerId: string, payload: VerifyCustomerDto) {
    return this.anchor.verifyCustomer(customerId, payload);
  }

  async updateCustomer(customerId: string, payload: Partial<CreateCustomerDto>) {
    return this.anchor.updateCustomer(customerId, payload);
  }

  async deleteCustomer(customerId: string) {
    return this.anchor.deleteCustomer(customerId);
  }
}
