import React from 'react';
import Header from '../../components/Header/Header';
import './About.css';

const About = () => {
    return (
        <div className='about'>
            <Header />
            <div className='about-container'>
                <main className='about-content'>
                    <h2>Sobre o Projeto</h2>

                    <section className='about-section'>
                        <p>
                            Este projeto é uma plataforma de e-commerce desenvolvida para facilitar a navegação, visualização e compra de produtos de forma prática e moderna.
                            O sistema permite ao usuário explorar uma variedade de itens fornecidos por diferentes distribuidores, aplicar filtros personalizados, favoritar seus produtos preferidos
                            e concluir suas compras com simplicidade.
                        </p>
                        <p>
                            Além disso, todos os pedidos são registrados, possibilitando que o usuário consulte seu histórico de compras posteriormente. A interface é responsiva e pensada
                            para oferecer uma experiência agradável tanto no desktop quanto em dispositivos móveis.
                        </p>
                    </section>

                    <section className='about-section'>
                        <h3>Funcionalidades principais</h3>
                        <ul>
                            <li>Busca e filtros por nome, categoria, material, fornecedor e preço</li>
                            <li>Exibição detalhada dos produtos com imagem e descrição</li>
                            <li>Favoritar itens para acesso rápido</li>
                            <li>Adicionar ao carrinho com controle de quantidade</li>
                            <li>Finalização de pedidos com persistência</li>
                            <li>Layout moderno, responsivo e acessível</li>
                        </ul>
                    </section>

                    <section className='about-section'>
                        <h3>Fontes dos Produtos (APIs)</h3>
                        <p><strong>Fornecedor Brasileiro</strong></p>
                        <ul>
                            <li>Todos os produtos: <code>GET http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider</code></li>
                            <li>Produto por ID: <code>GET http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/brazilian_provider/:id</code></li>
                        </ul>

                        <p><strong>Fornecedor Europeu</strong></p>
                        <ul>
                            <li>Todos os produtos: <code>GET http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider</code></li>
                            <li>Produto por ID: <code>GET http://616d6bdb6dacbb001794ca17.mockapi.io/devnology/european_provider/:id</code></li>
                        </ul>
                    </section>


                </main>
            </div>
        </div>
    );
};

export default About;
