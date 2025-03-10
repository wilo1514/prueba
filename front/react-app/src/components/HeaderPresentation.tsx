// src/components/Header.tsx (ejemplo)
import React from 'react';
import logo from '../assets/logo.png'; // Ajusta la ruta a tu imagen

const Header: React.FC = () => {
    return (
        <nav className="navbar navbar-light bg-light shadow-sm mb-3">
            <div className="container">
                {/* Imagen alineada a la izquierda */}
                <a href="/" className="navbar-brand d-flex align-items-center">
                    <img
                        src={logo}
                        alt="Mi Logo"
                        style={{ height: '50px', marginRight: '0.5rem' }}
                    />
                    <span className="h4 mb-0">Mega Tienda del Sur</span>
                </a>

                {/* Iconos o botones a la derecha */}
                <div className="d-flex">
                    <button className="btn btn-outline-secondary me-2" title="Usuario">
                        <i className="fa-solid fa-user"></i>
                    </button>
                    <button className="btn btn-outline-secondary" title="Configuración">
                        <i className="fa-solid fa-gear"></i>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;
