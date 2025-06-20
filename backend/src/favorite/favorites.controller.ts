import { Controller, Post, Delete, Get, Param, Request, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';

@UseGuards(AuthGuard('jwt'))
@Controller('favorites')
export class FavoritesController {
    constructor(private favoritesService: FavoritesService) { }

    @Post()
    addFavorite(@Request() req, @Body() body: { productId: string, provider: string }) {
        return this.favoritesService.addFavorite(req.user.id, body.productId, body.provider);
    }

    @Delete(':productId/:provider')
    removeFavorite(
        @Request() req,
        @Param('productId') productId: string,
        @Param('provider') provider: string,
    ) {
        return this.favoritesService.removeFavorite(req.user.id, productId, provider);
    }


    @Get()
    getFavorites(@Request() req) {
        return this.favoritesService.getFavorites(req.user.id);
    }
}
