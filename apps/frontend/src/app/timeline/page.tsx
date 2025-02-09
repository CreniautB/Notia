'use client';
import { TimelineEvent } from '@notia/shared/interfaces/TimelineType';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { parse } from 'date-fns';
import type { NextPage } from 'next';
import { TextureLoader } from 'three';
import { Raycaster, Vector2, CatmullRomCurve3 } from 'three';
import { CanvasTexture } from 'three';
import { BackSide } from 'three';

// Ajout de la vérification de window
declare global {
  interface Window {
    innerWidth: number;
    innerHeight: number;
  }
}

const historicEvents: TimelineEvent[] = [
  {
    id: '1',
    date: '14/07/1789',
    title: 'Prise de la Bastille',
    description:
      "Événement emblématique de la Révolution française, marquant le début d'une nouvelle ère.",
    imageUrl: 'https://picsum.photos/600/400',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Prise_de_la_Bastille',
  },
  {
    id: '10',
    date: '14/07/1809',
    title: 'Prise de la Bastille',
    description:
      "Événement emblématique de la Révolution française, marquant le début d'une nouvelle ère.",

    imageUrl: 'https://picsum.photos/600/400',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Prise_de_la_Bastille',
  },
  {
    id: '2',
    date: '02/12/1804',
    title: 'Sacre de Napoléon',
    description: 'Napoléon Bonaparte se couronne empereur des Français à Notre-Dame de Paris.',
    imageUrl: 'https://picsum.photos/600/400',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sacre_de_Napol%C3%A9on_Ier',
  },
  {
    id: '3',
    date: '18/06/1940',
    title: 'Appel du 18 juin',
    description:
      'Discours historique du Général de Gaulle appelant à la Résistance depuis Londres.',
    imageUrl: 'https://picsum.photos/600/400',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Appel_du_18_Juin',
  },
  {
    id: '6',
    date: '18/06/1940',
    title: 'Appel du 18 juin',
    description:
      'Discours historique du Général de Gaulle appelant à la Résistance depuis Londres.',
    imageUrl: 'https://picsum.photos/600/400',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Appel_du_18_Juin',
  },
  {
    id: '5',
    date: '18/06/1940',
    title: 'Appel du 18 juin',
    description:
      'Discours historique du Général de Benjamin appelant à la Résistance depuis Londres.',
    imageUrl: 'https://picsum.photos/600/400',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Appel_du_18_Juin',
  },
  {
    id: '4',
    date: '08/05/1945',
    title: 'Victoire des Alliés',
    description:
      "Fin de la Seconde Guerre mondiale en Europe, jour de la capitulation de l'Allemagne nazie.",
    imageUrl: 'https://picsum.photos/600/400',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/8_mai_1945',
  },
];

const TimelinePage: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();

    // Créer un dégradé de fond
    const skyGeometry = new THREE.SphereGeometry(50, 32, 32);
    const uniforms = {
      topColor: { value: new THREE.Color(0xffffff) }, // Blanc pur
      bottomColor: { value: new THREE.Color(0xe0e0e0) }, // Gris très clair
      offset: { value: 15 },
      exponent: { value: 0.4 }, // Rendre le dégradé plus doux
    };

    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, .0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: BackSide,
    });

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Camera setup with initial position at timeline start
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Positionner la caméra au début de la timeline
    camera.position.set(-15, 3, 8);
    camera.lookAt(-12, 0, 0); // Regarder le début de la timeline

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Restricted controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Désactiver le zoom
    // controls.enableZoom = false;

    // Limiter la rotation
    // controls.minPolarAngle = Math.PI / 3; // 60 degrés
    // controls.maxPolarAngle = Math.PI / 2.5; // ~72 degrés
    // controls.minAzimuthAngle = -Math.PI / 6; // -30 degrés
    // controls.maxAzimuthAngle = Math.PI / 6; // 30 degrés

    // Désactiver le pan
    controls.enablePan = false;

    // Ajuster le point de pivot des contrôles
    controls.target.set(-12, 0, 0);

    // Timeline Line modification
    const sortedEvents = [...historicEvents].sort((a, b) => {
      const dateA = parse(a.date, 'dd/MM/yyyy', new Date());
      const dateB = parse(b.date, 'dd/MM/yyyy', new Date());
      return dateA.getTime() - dateB.getTime();
    });

    const dates = sortedEvents.map((e) => parse(e.date, 'dd/MM/yyyy', new Date()));
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const timeRange = maxDate.getTime() - minDate.getTime();

    // Timeline Curve creation - UNIQUEMENT cette partie pour la ligne
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      points.push(
        new THREE.Vector3(
          -12 + t * 24, // x: de -12 à 12
          Math.sin(t * Math.PI * 2) * 0.15, // réduit de 0.3 à 0.15
          Math.cos(t * Math.PI * 3) * 0.1 // réduit de 0.2 à 0.1
        )
      );
    }

    const curve = new CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      100, // segments tubulaires
      0.05, // rayon
      80, // segments radiaux
      false // non fermé
    );

    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2244ff,
      metalness: 0.4,
      roughness: 0.6,
      emissive: 0x1133ff,
      emissiveIntensity: 0.2,
    });

    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    scene.add(tube);

    // Stocker les références des sphères et des cubes
    const eventObjects: { sphere: THREE.Mesh; card?: THREE.Mesh; t: number }[] = [];

    // Event markers and cards
    sortedEvents.forEach((event) => {
      const date = parse(event.date, 'dd/MM/yyyy', new Date());
      const t = (date.getTime() - minDate.getTime()) / timeRange;

      // Créer le marqueur (sphère)
      const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      scene.add(sphere);

      // Charger l'image pour la carte
      const textureLoader = new TextureLoader();
      textureLoader.load(event.imageUrl, (texture) => {
        // Créer un canvas pour combiner image et texte
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 1024;

        if (ctx) {
          // Améliorer la qualité du texte
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fond noir semi-transparent
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Ajouter l'image
          const aspectRatio = texture.image.width / texture.image.height;
          const imageHeight = canvas.height * 0.6;
          const imageWidth = imageHeight * aspectRatio;
          ctx.drawImage(texture.image, (canvas.width - imageWidth) / 2, 0, imageWidth, imageHeight);

          // Ajouter le texte
          ctx.fillStyle = 'white';
          ctx.font = 'bold 64px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(event.title, canvas.width / 2, imageHeight + 100);

          ctx.font = '48px Arial';
          ctx.fillText(event.date, canvas.width / 2, imageHeight + 180);
        }

        // Créer la texture à partir du canvas
        const cardTexture = new CanvasTexture(canvas);

        // Créer la carte
        const cardGeometry = new THREE.PlaneGeometry(1.2, 1.2);
        const cardMaterial = new THREE.MeshBasicMaterial({
          map: cardTexture,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        scene.add(card);

        // Ajouter la carte aux objets à animer
        const eventObject = eventObjects.find((obj) => obj.sphere === sphere);
        if (eventObject) {
          eventObject.card = card;
        }

        cubeLinks.set(card, event.wikipediaUrl);
      });

      // Stocker la référence
      eventObjects.push({ sphere, t });
    });

    // Keyboard controls for timeline navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      const speed = 0.5;
      switch (event.key) {
        case 'ArrowRight':
          if (camera.position.x < 12) {
            camera.position.x += speed;
            controls.target.x += speed;
          }
          break;
        case 'ArrowLeft':
          if (camera.position.x > -15) {
            // Limite gauche ajustée
            camera.position.x -= speed;
            controls.target.x -= speed;
          }
          break;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Raycaster setup
    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const cubeLinks = new Map(); // Pour stocker les associations cube -> lien

    // Click handler
    const handleClick = (event: MouseEvent) => {
      if (!canvasRef.current) return;

      // Calculer la position de la souris en coordonnées normalisées (-1 à +1)
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Mettre à jour le raycaster
      raycaster.setFromCamera(mouse, camera);

      // Vérifier les intersections
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const clickedCube = intersects[0].object;
        const link = cubeLinks.get(clickedCube);
        if (link && typeof window !== 'undefined') {
          window.open(link, '_blank');
        }
      }
    };

    if (typeof window !== 'undefined') {
      canvasRef.current.addEventListener('click', handleClick);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Augmenter l'intensité
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Animation
    function animate() {
      requestAnimationFrame(animate);

      // Animer la courbe
      const time = Date.now() * 0.001;
      points.forEach((point, i) => {
        const t = i / 20;
        point.y = Math.sin(t * Math.PI * 2 + time * 0.5) * 0.15;
        point.z = Math.cos(t * Math.PI * 3 + time * 0.5) * 0.1;
      });

      // Mettre à jour la géométrie du tube
      curve.points = points;
      tube.geometry = new THREE.TubeGeometry(curve, 100, 0.05, 80, false);

      // Mettre à jour la position des sphères et des cartes
      eventObjects.forEach(({ sphere, card, t }, index) => {
        const point = curve.getPoint(t);
        sphere.position.copy(point);

        if (card) {
          card.position.copy(point);

          // Calculer un décalage vertical basé sur l'index
          const sameDateEvents = eventObjects.filter(
            (obj) => Math.abs(obj.t - t) < 0.01 // Événements proches sur la timeline
          );
          const indexInGroup = sameDateEvents.findIndex((obj) => obj.sphere === sphere);

          // Alterner les cartes en hauteur
          const baseHeight = 1.0; // Hauteur de base réduite
          const heightOffset = indexInGroup * 0.8; // Décalage entre les cartes
          card.position.y += baseHeight + heightOffset;

          // Décaler légèrement en profondeur pour éviter les z-fighting
          card.position.z += indexInGroup * 0.1;

          // Orienter la carte vers la caméra
          card.lookAt(camera.position);
        }
      });

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Update cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown);
        canvasRef.current?.removeEventListener('click', handleClick);
      }
      cubeLinks.clear();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full" style={{ cursor: 'pointer' }} />
    </>
  );
};

export default TimelinePage;
