// ====== ТАИНСТВЕННЫЙ ЛЕС - ВОРОН ТАРО ======
console.log('🌲=== ТАИНСТВЕННЫЙ ЛЕС: ВОРОН ТАРО ===🌲');

// Основные переменные
let scene, camera, renderer, ravenModel, flightPath;
let progress = 0;
const flightSpeed = 0.0015; // БЫСТРАЯ скорость полёта
let isCarryingFragment = true;
let mapFragment, fragmentDropped = false;

// Инициализация игры
function init() {
    console.log('1. Создаю мир таинственного леса...');
    updateStatus('Создаю мир таинственного леса...');
    
    try {
        // ========== 1. СОЗДАНИЕ СЦЕНЫ С АТМОСФЕРОЙ ЛЕСА ==========
        scene = new THREE.Scene();
        
        // Градиентный фон таинственного леса (тёмные оттенки зелёного)
        const fogColor = new THREE.Color(0x0a1a0a); // Тёмный лесной цвет
        scene.background = fogColor;
        scene.fog = new THREE.Fog(fogColor, 15, 60); // Туман для атмосферы
        
        console.log('2. Сцена леса создана');
        
        // ========== 2. КАМЕРА ДЛЯ ДРАМАТИЧНОГО ВИДА ==========
        camera = new THREE.PerspectiveCamera(
            70, // Широкий угол для кинематографичного вида
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );
        // Камера следует за вороном
        camera.position.set(0, 8, 25);
        console.log('3. Камера настроена');
        
        // ========== 3. РЕНДЕРЕР С НАСТРОЙКАМИ ДЛЯ МОБИЛЬНЫХ ==========
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('game-container').appendChild(renderer.domElement);
        console.log('4. Рендерер создан');
        
        // ========== 4. ОСВЕЩЕНИЕ ЛЕСА ==========
        // Лунный свет (основной источник)
        const moonLight = new THREE.DirectionalLight(0x8a9b8f, 0.6);
        moonLight.position.set(-10, 20, 10);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        scene.add(moonLight);
        
        // Тёплый свет от "фонарей" леса
        const forestLight1 = new THREE.PointLight(0x5d7c5a, 0.4, 30);
        forestLight1.position.set(-15, 5, -10);
        scene.add(forestLight1);
        
        const forestLight2 = new THREE.PointLight(0x8a6d3b, 0.3, 30);
        forestLight2.position.set(15, 3, -8);
        scene.add(forestLight2);
        
        // Загадочное свечение
        const ambientGlow = new THREE.AmbientLight(0x2c3e2c, 0.3);
        scene.add(ambientGlow);
        
        console.log('5. Освещение леса настроено');
        
        // ========== 5. ДРАМАТИЧНАЯ ТРАЕКТОРИЯ ПОЛЁТА ==========
        createDramaticFlightPath();
        
        // ========== 6. ФРАГМЕНТ КАРТЫ ТАРО ==========
        createTarotFragment();
        
        // ========== 7. ЗАГРУЗКА ВОРОНА ==========
        loadRaven();
        
        // ========== 8. ДЕРЕВЬЯ И АТМОСФЕРА ==========
        createForestAtmosphere();
        
        // ========== 9. ЗАПУСК АНИМАЦИИ ==========
        animate();
        window.addEventListener('resize', onWindowResize);
        
        console.log('✅ Мир таинственного леса создан!');
        updateStatus('Ворон приближается из глубины леса...');
        
    } catch (error) {
        console.error('❌ Ошибка создания мира:', error);
        updateStatus(`Ошибка: ${error.message}`, 'error');
    }
}

// ========== ДРАМАТИЧНАЯ ТРАЕКТОРИЯ ==========
function createDramaticFlightPath() {
    console.log('Создаю драматичную траекторию полёта...');
    
    // Траектория: издалека -> приближение -> сброс -> отдаление
    flightPath = new THREE.CatmullRomCurve3([
        // Начало: далеко в лесу
        new THREE.Vector3(-60, 25, -40),
        
        // Приближение к зрителю
        new THREE.Vector3(-40, 18, -25),
        new THREE.Vector3(-25, 12, -10),
        
        // Точка сброса карты (близко к камере)
        new THREE.Vector3(0, 8, 5),
        
        // Отдаление после сброса
        new THREE.Vector3(20, 12, 15),
        new THREE.Vector3(40, 18, 25),
        new THREE.Vector3(60, 25, 40)
    ]);
    
    // Визуализация пути (только для отладки)
    const points = flightPath.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x5d7c5a,
        transparent: true,
        opacity: 0.3
    });
    const pathLine = new THREE.Line(geometry, material);
    scene.add(pathLine);
}

// ========== ФРАГМЕНТ КАРТЫ ТАРО ==========
function createTarotFragment() {
    console.log('Создаю фрагмент карты Таро...');
    
    // Геометрия карты Таро
    const geometry = new THREE.PlaneGeometry(2.5, 3.5); // Размер как у карты Таро
    const texture = createTarotTexture(); // Создаём текстуру карты
    
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    mapFragment = new THREE.Mesh(geometry, material);
    mapFragment.visible = false;
    mapFragment.rotation.x = Math.PI / 2; // Лежит горизонтально
    scene.add(mapFragment);
    
    // Свечение карты
    const glowGeometry = new THREE.PlaneGeometry(3, 4);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    mapFragment.add(glow); // Свечение как дочерний элемент
}

// ========== СОЗДАНИЕ ТЕКСТУРЫ КАРТЫ ТАРО ==========
function createTarotTexture() {
    // Создаём canvas для текстуры карты
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 356;
    const ctx = canvas.getContext('2d');
    
    // Фон карты
    ctx.fillStyle = '#1a0f0a';
    ctx.fillRect(0, 0, 256, 356);
    
    // Золотая рамка
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 236, 336);
    
    // Узор углов
    ctx.fillStyle = '#8a6d3b';
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(40, 20);
    ctx.lineTo(20, 40);
    ctx.fill();
    
    // Символ Таро (руна или аркан)
    ctx.font = 'bold 48px serif';
    ctx.fillStyle = '#ffed4e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('XIII', 128, 100); // Карта Смерти (символично)
    
    // Текст
    ctx.font = '20px Georgia';
    ctx.fillStyle = '#e6d5b8';
    ctx.fillText('ФРАГМЕНТ', 128, 200);
    ctx.fillText('ТАРО', 128, 230);
    
    // Создаём текстуру из canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

// ========== ЗАГРУЗКА ВОРОНА ==========
function loadRaven() {
    console.log('Загружаю могучего ворона...');
    updateStatus('Призываю ворона из тумана...');
    
    const loader = new THREE.GLTFLoader();
    
    // 🔴 ВАЖНО: Обновите эту ссылку на вашу модель в НОВОМ репозитории
    const modelUrl = 'https://cdn.jsdelivr.net/gh/Fffibi9956-ctrl/raven---game/raven.glb';
    
    loader.load(
        modelUrl,
        // Успешная загрузка
        function(gltf) {
            console.log('✅ Могучий ворон загружен!');
            ravenModel = gltf.scene;
            
            // ⭐⭐⭐ БОЛЬШОЙ ВОРОН ⭐⭐⭐
            ravenModel.scale.set(4.5, 4.5, 4.5); // ОЧЕНЬ большой ворон
            
            // Позиционирование
            ravenModel.rotation.y = Math.PI / 2;
            
            // Добавляем тень
            ravenModel.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(ravenModel);
            
            updateStatus('Ворон появился! Следите за его полётом...');
            console.log('Ворон добавлен в сцену (масштаб 4.5)');
            
        },
        // Прогресс загрузки
        function(xhr) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            updateStatus(`Загрузка ворона: ${percent}%...`);
        },
        // Ошибка
        function(error) {
            console.error('Ошибка загрузки ворона:', error);
            updateStatus('Использую магического ворона...');
            
            // Резервный ворон (стилизованный)
            const group = new THREE.Group();
            
            // Тело
            const bodyGeometry = new THREE.ConeGeometry(1.5, 3, 8);
            const bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x222222,
                shininess: 30
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1;
            group.add(body);
            
            // Крылья
            const wingGeometry = new THREE.PlaneGeometry(3, 1.5);
            const wingMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x111111,
                side: THREE.DoubleSide
            });
            
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-2, 1, 0);
            leftWing.rotation.z = Math.PI / 4;
            group.add(leftWing);
            
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(2, 1, 0);
            rightWing.rotation.z = -Math.PI / 4;
            group.add(rightWing);
            
            // Глаза (свечение)
            const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff5500,
                emissive: 0xff2200
            });
            
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.5, 2.5, 1);
            group.add(leftEye);
            
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.5, 2.5, 1);
            group.add(rightEye);
            
            ravenModel = group;
            ravenModel.scale.set(4.5, 4.5, 4.5);
            scene.add(ravenModel);
        }
    );
}

// ========== АТМОСФЕРА ЛЕСА ==========
function createForestAtmosphere() {
    console.log('Добавляю атмосферу леса...');
    
    // Частицы тумана
    const fogParticles = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = Math.random() * 20;
        positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    fogParticles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const fogMaterial = new THREE.PointsMaterial({
        color: 0x5d7c5a,
        size: 2,
        transparent: true,
        opacity: 0.3
    });
    
    const fog = new THREE.Points(fogParticles, fogMaterial);
    scene.add(fog);
    
    // Простые деревья на заднем плане
    for (let i = 0; i < 10; i++) {
        const tree = createTree();
        tree.position.set(
            (Math.random() - 0.5) * 80,
            0,
            -40 - Math.random() * 30
        );
        tree.scale.setScalar(3 + Math.random() * 4);
        scene.add(tree);
    }
}

function createTree() {
    const group = new THREE.Group();
    
    // Ствол
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 3);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    group.add(trunk);
    
    // Крона
    const crownGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const crownMaterial = new THREE.MeshPhongMaterial({ color: 0x2e7d32 });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 4;
    group.add(crown);
    
    return group;
}

// ========== ГЛАВНЫЙ ЦИКЛ АНИМАЦИИ ==========
function animate() {
    requestAnimationFrame(animate);
    
    // Если ворон загружен и полёт не завершён
    if (ravenModel && progress < 1) {
        // Быстрое движение по траектории
        progress += flightSpeed;
        const currentPosition = flightPath.getPoint(progress);
        ravenModel.position.copy(currentPosition);
        
        // Плавный поворот по траектории
        const tangent = flightPath.getTangent(progress);
        ravenModel.lookAt(
            ravenModel.position.x + tangent.x,
            ravenModel.position.y + tangent.y,
            ravenModel.position.z + tangent.z
        );
        
        // Анимация крыльев (простая)
        if (ravenModel.children) {
            ravenModel.children.forEach(child => {
                if (child.type === 'Mesh' && child.geometry.type === 'PlaneGeometry') {
                    child.rotation.z = Math.sin(Date.now() * 0.005 + progress * 10) * 0.3;
                }
            });
        }
        
        // Если ворон несёт фрагмент карты
        if (isCarryingFragment && mapFragment) {
            mapFragment.visible = true;
            
            // Позиция карты в когтях ворона
            const clawPosition = new THREE.Vector3(0, -1, 1.5);
            ravenModel.localToWorld(clawPosition);
            mapFragment.position.copy(clawPosition);
            
            // Карта всегда горизонтальна
            mapFragment.lookAt(camera.position);
            
            // Мерцание карты
            mapFragment.rotation.z = Math.sin(Date.now() * 0.003) * 0.1;
        }
        
        // Сброс карты в заданной точке траектории (когда ворон ближе всего)
        if (progress > 0.45 && progress < 0.46 && !fragmentDropped) {
            dropTarotFragment();
            fragmentDropped = true;
        }
        
        // Обновление камеры (следит за вороном)
        updateCamera(progress);
    }
    
    // Рендеринг
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// ========== УМНАЯ КАМЕРА ==========
function updateCamera(progress) {
    // Камера следует за вороном, но с отставанием
    const ravenPos = ravenModel.position.clone();
    
    // Позиция камеры зависит от этапа полёта
    let cameraOffset;
    if (progress < 0.3) {
        // Начало: камера далеко, общий план
        cameraOffset = new THREE.Vector3(0, 10, 35);
    } else if (progress < 0.6) {
        // Средняя часть: приближение
        cameraOffset = new THREE.Vector3(0, 5, 20);
    } else {
        // Конец: отдаление
        cameraOffset = new THREE.Vector3(0, 12, 40);
    }
    
    // Плавное движение камеры
    camera.position.lerp(
        new THREE.Vector3(
            ravenPos.x + cameraOffset.x,
            ravenPos.y + cameraOffset.y,
            ravenPos.z + cameraOffset.z
        ),
        0.05
    );
    
    // Камера смотрит немного впереди ворона
    camera.lookAt(
        ravenPos.x,
        ravenPos.y + 2,
        ravenPos.z + 10
    );
}

// ========== СБРОС КАРТЫ ТАРО ==========
function dropTarotFragment() {
    if (!mapFragment) return;
    
    console.log('🎴 Ворон сбрасывает фрагмент карты Таро!');
    isCarryingFragment = false;
    
    updateStatus('Фрагмент Таро сброшен! Ищите его в лесу...');
    document.getElementById('fragment-counter').innerHTML = 
        '<span class="fragment-icon" style="background: #ff0000;"></span> Фрагмент собран!';
    
    // Анимация падения карты с вращением
    let fallSpeed = 0.1;
    let rotationSpeed = 0.05;
    let spin = 0;
    
    function animateFall() {
        // Падение
        mapFragment.position.y -= fallSpeed;
        
        // Вращение с ускорением
        spin += rotationSpeed;
        mapFragment.rotation.x = Math.PI / 2 + Math.sin(spin) * 0.5;
        mapFragment.rotation.z = spin;
        
        // Замедление
        fallSpeed *= 0.98;
        rotationSpeed *= 0.99;
        
        // Продолжаем, пока не упадёт
        if (mapFragment.position.y > 0) {
            requestAnimationFrame(animateFall);
        } else {
            // Эффект приземления
            mapFragment.position.y = 0;
            console.log('Карта Таро приземлилась');
            
            // Свечение на земле
            const glowGeometry = new THREE.CircleGeometry(3, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            });
            const groundGlow = new THREE.Mesh(glowGeometry, glowMaterial);
            groundGlow.rotation.x = -Math.PI / 2;
            groundGlow.position.copy(mapFragment.position);
            scene.add(groundGlow);
        }
    }
    
    animateFall();
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function updateStatus(text, type = 'info') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;
    
    if (type === 'error') {
        statusEl.innerHTML = `❌ ${text}`;
        statusEl.style.borderColor = '#ff4444';
    } else if (type === 'success') {
        statusEl.innerHTML = `✅ ${text}`;
        statusEl.style.borderColor = '#44ff44';
    } else {
        statusEl.innerHTML = `🔄 ${text}`;
        statusEl.style.borderColor = '#5d7c5a';
    }
}

function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// ========== ЗАПУСК ИГРЫ ==========
window.addEventListener('load', function() {
    console.log('🌙=== ЗАПУСК ТАИНСТВЕННОГО ЛЕСА ===🌙');
    
    // Задержка для атмосферы
    setTimeout(function() {
        console.log('Запускаю магию леса...');
        init();
        
        // Постепенное исчезновение заголовка
        setTimeout(() => {
            const title = document.getElementById('title');
            if (title) {
                title.style.transition = 'opacity 3s';
                title.style.opacity = '0';
            }
        }, 4000);
        
    }, 1500);
});

// Глобальная обработка ошибок
window.addEventListener('error', function(event) {
    console.error('Магическая ошибка:', event.error);
    updateStatus('Магия дала сбой... Попробуйте обновить страницу', 'error');
});

console.log('🔮 Скрипт таинственного леса загружен и готов к магии');
