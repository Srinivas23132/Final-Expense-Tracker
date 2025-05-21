import React, { useCallback } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import './style.css';

const Header = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            number: { value: 80, density: { enable: true, area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.3 },
            size: { value: 3, random: true },
            move: { enable: true, speed: 1.5 },
            links: { enable: false },
          },
          detectRetina: true,
        }}
        style={{
          position: 'absolute',
          zIndex: -1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Navbar */}
      <Navbar expand="lg" className="navbarCSS" style={{ position: 'relative', zIndex: 2 }}>
        <Container>
          <Navbar.Brand href="/" className="text-white fw-bold fs-4">
            💸 Expense Management System
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-responsive" style={{ backgroundColor: "#fff" }} />
          <Navbar.Collapse id="navbar-responsive" className="justify-content-end">
            <Nav>
              {/* Login/Logout button removed as requested */}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
