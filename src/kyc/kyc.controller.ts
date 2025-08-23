import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { KycService } from './kyc.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { VerifyCustomerDto } from './dto/verify-customer.dto';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('customers')
  async createCustomer(@Body() body: CreateCustomerDto) {
    return this.kycService.createCustomer(body);
  }

  @Get('customers/:id')
  async getCustomer(@Param('id') id: string) {
    return this.kycService.getCustomer(id);
  }

  @Post('customers/:id/verify')
  async verifyCustomer(@Param('id') id: string, @Body() body: VerifyCustomerDto) {
    return this.kycService.verifyCustomer(id, body);
  }

  @Put('customers/:id')
  async updateCustomer(@Param('id') id: string, @Body() body: Partial<CreateCustomerDto>) {
    return this.kycService.updateCustomer(id, body);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Param('id') id: string) {
    return this.kycService.deleteCustomer(id);
  }
}
