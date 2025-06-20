import { Controller, Post, Param, Body, Get, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
    constructor(private cartService: CartService) { }

    @Get()
    getCart(@Request() req) {
        return this.cartService.getCartItems(req.user.id);
    }

    @Post('add')
    addItem(@Request() req, @Body() body: { productId: string, productProvider: string, quantity: number }) {
        return this.cartService.addItem(req.user.id, body.productId, body.productProvider, body.quantity);
    }

    @Patch('item/:id')
    updateQuantity(@Param('id') id: number, @Body() body: { quantity: number }) {
        return this.cartService.updateItemQuantity(+id, body.quantity);
    }

    @Patch('item/:id/select')
    selectItem(@Param('id') id: number, @Body() body: { selected: boolean }) {
        return this.cartService.toggleItemSelection(+id, body.selected);
    }

    @Delete('item/:id')
    removeItem(@Param('id') id: number) {
        return this.cartService.removeItem(+id);
    }

}
