import { Controller, Post, Param, Body, Get, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sale.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('sales')
export class SalesController {
    constructor(private salesService: SalesService) { }

    @Post('finalize')
    finalize(@Request() req) {
        return this.salesService.finalizeSale(req.user.id);
    }

    @Get()
    getSales(@Request() req) {
        return this.salesService.getSalesByUser(req.user.id);
    }
}
