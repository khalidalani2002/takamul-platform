/**
 * TAKAMUL MASTER ENGINE
 * Decoupled Architecture | Visibility Trap Override
 */

// ==========================================
// 1. PRELOADER SAFETY SYSTEM
// ==========================================
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.visibility = 'hidden'; }, 600);
    }
}
setTimeout(hidePreloader, 3500); 
window.addEventListener('load', hidePreloader);

// ==========================================
// 2. FIREBASE CONFIGURATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAwrz0hv3ZPRQdfimQNbneWiSFrS4kY55k",
    authDomain: "takamul-95d7b.firebaseapp.com",
    projectId: "takamul-95d7b",
    storageBucket: "takamul-95d7b.firebasestorage.app",
    messagingSenderId: "635681370470",
    appId: "1:635681370470:web:9468d33192af70897358a7"
};

// ADDED: Storage variables ready to be used globally
let db, collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc, updateDoc;
let storage, ref, uploadBytes, getDownloadURL;

// ==========================================
// 3. THE VISIBILITY TRAP BREAKER
// ==========================================
// This forces elements to show up even if the animation engine freezes them
function breakVisibilityTrap() {
    document.querySelectorAll('.gs-fade-up, .page-container, .team-member, .blog-post, .rich-text-content').forEach(el => {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('transform', 'none', 'important');
    });
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}

async function initFirebase() {
    try {
        const firebaseApp = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js");
        const firestore = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js");
        
        // ADDED: Import the Storage engine using the exact same version (10.8.1)
        const firebaseStorage = await import("https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js");
        
        const app = firebaseApp.initializeApp(firebaseConfig);
        db = firestore.getFirestore(app);
        
        // ADDED: Turn on the Storage engine and link the functions
        storage = firebaseStorage.getStorage(app);
        ref = firebaseStorage.ref;
        uploadBytes = firebaseStorage.uploadBytes;
        getDownloadURL = firebaseStorage.getDownloadURL;
        
        collection = firestore.collection; getDocs = firestore.getDocs; addDoc = firestore.addDoc;
        deleteDoc = firestore.deleteDoc; doc = firestore.doc; setDoc = firestore.setDoc; 
        getDoc = firestore.getDoc; updateDoc = firestore.updateDoc;

        // Decoupled Execution: Run everything independently
        setTimeout(() => {
            applyPageBackground().catch(e => console.log(e));
            loadPublicTeam().catch(e => console.log(e));
            loadPublicPosts().catch(e => console.log(e));
            loadPublicAbout().catch(e => console.log(e));
            loadPublicContact().catch(e => console.log(e));
            loadPublicMarquee().catch(e => console.log(e));
            loadSingleArticle().catch(e => console.log(e));
            
            if(document.querySelector('.admin-sidebar')) {
                loadAdminBackgrounds().catch(e => console.log(e));
                loadAdminPosts().catch(e => console.log(e));
                loadAdminTeam().catch(e => console.log(e));
                loadAdminContact().catch(e => console.log(e));
                loadAdminMarquee().catch(e => console.log(e));
            }
        }, 100);
        
    } catch (err) { 
        console.error("Firebase Connection Error:", err); 
    }
}

// ==========================================
// 4. IMAGE COMPRESSOR
// ==========================================
function compressImage(file, maxWidth, quality, type = 'image/jpeg') {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = Math.min(maxWidth / img.width, 1);
                canvas.width = img.width * scale; canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL(type, quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ==========================================
// 5. AUTHENTICATION & NAVIGATION
// ==========================================
function toggleMenu() { document.getElementById('nav-links')?.classList.toggle('active'); }
function logout() { window.location.href = "index.html"; }

function checkLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === "aya" && p === "root1234") {
        window.location.href = "admin-dashboard.html";
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

// ==========================================
// 6. ADMIN UI & BACKGROUNDS
// ==========================================
function switchAdminTab(tabId) {
    const tabs = document.querySelectorAll('.admin-tab');
    if(!tabs.length) return;
    tabs.forEach(t => t.style.display = 'none');
    document.querySelectorAll('.admin-sidebar ul li a').forEach(a => a.classList.remove('active'));
    document.getElementById('tab-' + tabId).style.display = 'block';
    document.getElementById('nav-' + tabId).classList.add('active');
}

let currentImageBase64 = ""; 
async function previewImage(event, previewId) {
    const file = event.target.files[0];
    const preview = document.getElementById(previewId);
    if (!file) { currentImageBase64 = ""; preview.style.display = 'none'; return; }
    currentImageBase64 = await compressImage(file, 800, 0.7);
    preview.src = currentImageBase64;
    preview.style.display = 'block';
}

async function saveBackground(page) {
    const btn = document.querySelector(`#tab-${page} .btn-orange`);
    btn.innerText = "Saving...";
    const url = document.getElementById(`bg-url-${page}`).value;
    const file = document.getElementById(`bg-file-${page}`).files[0];
    let bgs = {};
    const snap = await getDoc(doc(db, "takamul_settings", "backgrounds"));
    if(snap.exists()) bgs = snap.data();
    if (url) bgs[page] = url;
    else if (file) bgs[page] = await compressImage(file, 1920, 0.8);
    else delete bgs[page];
    await setDoc(doc(db, "takamul_settings", "backgrounds"), bgs);
    alert("Background Updated!");
    btn.innerText = "Save Background";
}

async function loadAdminBackgrounds() {
    if(!db) return;
    const snap = await getDoc(doc(db, "takamul_settings", "backgrounds"));
    if(snap.exists()) {
        const bgs = snap.data();
        ['achievements', 'team', 'about', 'contact'].forEach(p => {
            const input = document.getElementById(`bg-url-${p}`);
            if (input && bgs[p] && !bgs[p].startsWith('data:image')) input.value = bgs[p];
        });
    }
}

async function applyPageBackground() {
    const body = document.body;
    if (body.classList.contains('frosted-theme') && db) {
        const page = body.getAttribute('data-page');
        const snap = await getDoc(doc(db, "takamul_settings", "backgrounds"));
        if(snap.exists() && snap.data()[page]) body.style.backgroundImage = `url('${snap.data()[page]}')`;
    }
}

// ==========================================
// 7. ACHIEVEMENTS CMS
// ==========================================
let quillAchievements; let editingPostId = null; 
async function submitPost() {
    if(!db) return alert("Database connecting...");
    const title = document.getElementById('post-title').value;
    const brief = document.getElementById('post-brief').value;
    const bodyHTML = quillAchievements.root.innerHTML; 
    if(!title || !brief || bodyHTML === '<p><br></p>') return alert("Fill all fields.");
    
    document.getElementById('publish-btn').innerText = "Publishing...";
    
    if (editingPostId) {
        await updateDoc(doc(db, "takamul_achievements", editingPostId), { title, brief, body: bodyHTML, ...(currentImageBase64 && { image: currentImageBase64 }) });
        editingPostId = null;
    } else {
        await addDoc(collection(db, "takamul_achievements"), { title, brief, body: bodyHTML, image: currentImageBase64, date: new Date().toLocaleDateString(), timestamp: Date.now() });
    }
    location.reload();
}

async function editPost(id) {
    const snap = await getDoc(doc(db, "takamul_achievements", id));
    const post = snap.data();
    document.getElementById('post-title').value = post.title; 
    document.getElementById('post-brief').value = post.brief;
    quillAchievements.root.innerHTML = post.body;
    if (post.image) {
        document.getElementById('image-preview').src = post.image;
        document.getElementById('image-preview').style.display = 'block';
    }
    editingPostId = id; 
    document.getElementById('publish-btn').innerText = "Update Achievement";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletePost(id) {
    if(confirm("Delete this achievement forever?")) {
        await deleteDoc(doc(db, "takamul_achievements", id));
        loadAdminPosts();
    }
}

async function loadAdminPosts() {
    const el = document.getElementById('admin-post-list'); if (!el || !db) return;
    const snapshot = await getDocs(collection(db, "takamul_achievements"));
    let posts = []; snapshot.forEach(d => posts.push({id: d.id, ...d.data()}));
    posts.sort((a,b) => b.timestamp - a.timestamp);
    el.innerHTML = posts.map(p => `
        <div class="admin-list-item">
            <div><strong>${p.title}</strong></div>
            <div>
                <button class="admin-action-btn btn-edit" onclick="editPost('${p.id}')">Edit</button>
                <button class="admin-action-btn btn-delete" onclick="deletePost('${p.id}')">Delete</button>
            </div>
        </div>
    `).join('') || "<p>No achievements posted.</p>";
}

async function loadPublicPosts() {
    const el = document.getElementById('blog-container'); if (!el || !db) return;
    // Look at the new 'achievements' database
    const snapshot = await getDocs(collection(db, "achievements")); 
    let posts = []; snapshot.forEach(d => posts.push({id: d.id, ...d.data()}));
    posts.sort((a,b) => b.timestamp - a.timestamp);
    
    el.innerHTML = posts.map(p => {
        // Bilingual check
        const title = typeof p.title === 'object' ? p.title[window.currentLang] : p.title;
        return `
        <div class="blog-post" style="opacity: 1 !important; visibility: visible !important; transform: none !important; cursor:pointer;" onclick="window.location.href='article.html?id=${p.id}'">
            <img src="${p.image}" class="blog-post-img">
            <div class="blog-post-content">
                <h2>${title}</h2>
                <small>${p.date || ''}</small>
                <p style="color:var(--primary); font-weight:600; margin-top:auto;">Read More &rarr;</p>
            </div>
        </div>`;
    }).join('') || "<p>More achievements coming soon.</p>";
}

async function loadSingleArticle() {
    const el = document.getElementById('single-article-container'); if (!el || !db) return;
    const postId = new URLSearchParams(window.location.search).get('id');
    const snap = await getDoc(doc(db, "takamul_achievements", postId));
    if (!snap.exists()) { el.innerHTML = "<h1>Achievement not found.</h1>"; return; }
    const post = snap.data();
    el.innerHTML = `
        ${post.image ? `<img src="${post.image}" class="article-header-img">` : ''}
        <h1>${post.title}</h1>
        <small>${post.date}</small>
        <div class="rich-text-content" style="opacity: 1 !important; visibility: visible !important;">${post.body}</div>
    `;
    breakVisibilityTrap();
}

// ==========================================
// 8. TEAM CMS
// ==========================================
// 1. ADD TEAM MEMBER
    window.addTeamMember = async () => {
        const nameEn = document.getElementById('team-name-en').value;
        const nameAr = document.getElementById('team-name-ar').value;
        const roleEn = document.getElementById('team-role-en').value;
        const roleAr = document.getElementById('team-role-ar').value;
        const file = document.getElementById('team-image').files[0];

        if (!nameEn || !nameAr || !roleEn || !roleAr || !file) {
            alert("Please fill all English and Arabic fields, and add a photo.");
            return;
        }

        try {
            // Using the compressor we built earlier so you never hit the 1MB limit!
            const compressedBase64 = await compressImage(file, 800, 0.7); 
            
            await addDoc(collection(db, "team"), {
                // Save as dual-language objects!
                name: { en: nameEn, ar: nameAr },
                role: { en: roleEn, ar: roleAr },
                image: compressedBase64,
                timestamp: Date.now()
            });

            alert("Team member added successfully!");
            document.getElementById('team-name-en').value = '';
            document.getElementById('team-name-ar').value = '';
            document.getElementById('team-role-en').value = '';
            document.getElementById('team-role-ar').value = '';
            document.getElementById('team-image').value = '';
            
            if (typeof loadAdminTeam === "function") loadAdminTeam();
        } catch (error) {
            console.error("Error adding team: ", error);
        }
    };

async function deleteTeamMember(id) {
    if(confirm("Remove this member?")) { await deleteDoc(doc(db, "takamul_team", id)); loadAdminTeam(); }
}

async function loadAdminTeam() {
    const el = document.getElementById('admin-team-list'); if (!el || !db) return;
    const snapshot = await getDocs(collection(db, "takamul_team"));
    let team = []; snapshot.forEach(d => team.push({id: d.id, ...d.data()}));
    el.innerHTML = team.map(t => `
        <div class="admin-list-item">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${t.image}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                <strong>${t.name}</strong>
            </div>
            <button class="admin-action-btn btn-delete" onclick="deleteTeamMember('${t.id}')">Delete</button>
        </div>
    `).join('') || "<p>No members added.</p>";
}

async function loadPublicTeam() {
    const el = document.getElementById('public-team-list'); if(!el || !db) return;
    // Look at the new 'team' database
    const snap = await getDocs(collection(db, "team")); 
    let team = []; snap.forEach(d => team.push({id: d.id, ...d.data()}));
    team.sort((a,b) => b.timestamp - a.timestamp);
    
    el.innerHTML = team.map(t => {
        // Bilingual check
        const name = typeof t.name === 'object' ? t.name[window.currentLang] : t.name;
        const role = typeof t.role === 'object' ? t.role[window.currentLang] : t.role;
        return `
        <div class="team-member" style="opacity: 1 !important; visibility: visible !important; transform: none !important; text-align: center;">
            <img src="${t.image}" class="team-photo">
            <h3>${name}</h3>
            <p style="color:var(--primary); font-weight:600;">${role}</p>
        </div>`;
    }).join('') || "<p>Our team is growing.</p>";
}

// ==========================================
// 9. CONTACT CMS
// ==========================================
// 4. ADD CONTACT ITEM
    window.addContactItem = async () => {
        const type = document.getElementById('contact-type').value;
        const valueEn = document.getElementById('contact-value-en').value;
        const valueAr = document.getElementById('contact-value-ar').value;
        const url = document.getElementById('contact-url').value;

        if (!valueEn || !valueAr) {
            alert("Please enter both English and Arabic display text.");
            return;
        }

        try {
            await addDoc(collection(db, "contact"), {
                type: type,
                value: { en: valueEn, ar: valueAr },
                url: url,
                timestamp: Date.now()
            });

            alert("Contact Method Added!");
            document.getElementById('contact-value-en').value = '';
            document.getElementById('contact-value-ar').value = '';
            document.getElementById('contact-url').value = '';
            
            if (typeof loadAdminContact === "function") loadAdminContact();
        } catch (error) {
            console.error("Error adding contact: ", error);
        }
    };

async function deleteContactItem(id) { await deleteDoc(doc(db, "takamul_contact", id)); loadAdminContact(); }

async function loadAdminContact() {
    const el = document.getElementById('admin-contact-list'); if (!el || !db) return;
    const snapshot = await getDocs(collection(db, "takamul_contact"));
    let contacts = []; snapshot.forEach(d => contacts.push({id: d.id, ...d.data()}));
    el.innerHTML = contacts.map(c => `
        <div class="admin-list-item">
            <div><strong>${c.type}:</strong> ${c.value}</div>
            <button class="admin-action-btn btn-delete" onclick="deleteContactItem('${c.id}')">Delete</button>
        </div>
    `).join('') || "<p>No contact info.</p>";
}

async function loadPublicContact() {
    const el = document.getElementById('public-contact-list'); if(!el || !db) return;
    // Look at the new 'contact' database
    const snap = await getDocs(collection(db, "contact")); 
    let contacts = []; snap.forEach(d => contacts.push({id: d.id, ...d.data()}));
    
    const groups = {};
    contacts.forEach(c => { if(!groups[c.type]) groups[c.type] = []; groups[c.type].push(c); });
    
    let html = "";
    for (const type in groups) {
        html += `<div class="contact-card" style="opacity: 1 !important; visibility: visible !important;"><h3>${type}</h3>`;
        groups[type].forEach(item => {
            // Bilingual check
            const value = typeof item.value === 'object' ? item.value[window.currentLang] : item.value;
            
            let href = item.url; let target = 'target="_blank"';
            if (type === "Email") { href = `mailto:${value}`; target = ""; }
            else if (type === "Phone") { href = `tel:${value.replace(/[^0-9+]/g, '')}`; target = ""; }
            html += href ? `<a href="${href}" ${target} class="contact-item">${value}</a>` : `<span class="contact-item">${value}</span>`;
        });
        html += `</div>`;
    }
    el.innerHTML = html || "<p style='color:#888;'>Contact details will be added soon.</p>";
    if(typeof breakVisibilityTrap === 'function') breakVisibilityTrap();
}

// ==========================================
// 10. ABOUT US CMS
// ==========================================
let quillAbout;
// 3. SAVE ABOUT US
   window.saveAbout = async () => {
        const contentEn = window.quillAboutEN.root.innerHTML;
        const contentAr = window.quillAboutAR.root.innerHTML;

        try {
            // We use addDoc because we know it is fully connected to your database
            await addDoc(collection(db, "about_data"), {
                content: { en: contentEn, ar: contentAr },
                timestamp: Date.now()
            });
            alert("About Page Updated Successfully!");
        } catch (error) {
            console.error("Error saving about: ", error);
            alert("Failed to save. Check the console.");
        }
    };

async function loadPublicAbout() {
    if(!db) return;
    const snap = await getDoc(doc(db, "takamul_settings", "about"));
    if (snap.exists()) {
        const el = document.getElementById('public-about-content'); 
        if(el) {
            el.innerHTML = snap.data().content;
            breakVisibilityTrap();
        }
        if(quillAbout) quillAbout.root.innerHTML = snap.data().content;
    }
}

// ==========================================
// 11. MARQUEE CMS
// ==========================================
async function addMarqueeImage(event) {
    if(!db) return alert("Database connecting...");
    const file = event.target.files[0];
    const base64Image = await compressImage(file, 400, 1.0, 'image/png');
    await addDoc(collection(db, "takamul_marquee"), { src: base64Image, timestamp: Date.now() });
    loadAdminMarquee();
}

async function deleteMarqueeImage(id) { await deleteDoc(doc(db, "takamul_marquee", id)); loadAdminMarquee(); }

async function loadAdminMarquee() {
    const el = document.getElementById('admin-marquee-list'); if (!el || !db) return;
    const snapshot = await getDocs(collection(db, "takamul_marquee"));
    let images = []; snapshot.forEach(d => images.push({id: d.id, ...d.data()}));
    el.innerHTML = images.map(img => `<div class="admin-marquee-thumb"><img src="${img.src}"><button onclick="deleteMarqueeImage('${img.id}')">X</button></div>`).join('');
}

async function loadPublicMarquee() {
    const track = document.getElementById('marquee-track'); if (!track || !db) return;
    const snapshot = await getDocs(collection(db, "takamul_marquee"));
    let images = []; snapshot.forEach(d => images.push({id: d.id, ...d.data()}));
    if(images.length === 0) return;
    document.getElementById('marquee-section').style.display = 'block';
    const html = images.map(img => `<img src="${img.src}" class="marquee-img">`).join('');
    track.innerHTML = html + html; 
}

// ==========================================
// 12. VISUALS (3D & GSAP)
// ==========================================
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 3.5));
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
        mainLight.position.set(10, 15, 10);
        scene.add(mainLight);

        const isMobile = window.innerWidth < 768;
        const sizeVal = isMobile ? "4.0" : "6.1"; 

        const geometry = new THREE.TorusGeometry(isMobile ? 3 : 4.5, isMobile ? 1.1 : 1.6, 160, 320);
        const material = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff, metalness: 0.95, roughness: 0.05, clearcoat: 1.0, clearcoatRoughness: 0.02 
        });
        
        material.onBeforeCompile = (shader) => {
            shader.uniforms.time = { value: 0 };
            shader.vertexShader = `uniform float time; ${shader.vertexShader}`.replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                float t = time * 0.35;
                vec3 s = normalize(position) * ${sizeVal}; 
                vec3 tar = mix(position, s, abs(sin(t)));
                transformed = tar + (normalize(position) * sin(time + position.x * 0.5) * 0.7);`
            );
            material.userData.shader = shader;
        };

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        camera.position.z = 22;

        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            if (material.userData.shader) material.userData.shader.uniforms.time.value = clock.getElapsedTime();
            mesh.rotation.y += 0.004; mesh.rotation.x += 0.002;
            renderer.render(scene, camera);
        }
        animate();
    } catch(e) { console.error("3D Pipeline Error", e); }
}

function initGSAP() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".gs-fade-up").forEach(el => {
        // Changed to allow inline styles to clear if the animation successfully fires
        gsap.from(el, { scrollTrigger: { trigger: el, start: "top 95%", once: true }, y: 30, opacity: 0, duration: 1, clearProps: "all" });
    });

    const wrapper = document.querySelector(".carousel-wrapper");
    const cards = gsap.utils.toArray(".carousel-card");
    if (wrapper && cards.length > 0) {
        cards.forEach((c, i) => i === 0 ? gsap.set(c, {y:0}) : gsap.set(c, {y:window.innerHeight}));
        const tl = gsap.timeline({ scrollTrigger: { trigger: wrapper, pin: true, scrub: 1, start: "top top", end: "+=3500" } });
        cards.forEach((c, i) => { if (i > 0) tl.to(c, { y: 0, duration: 1, ease: "none" }); });
    }
}

// ==========================================
// 13. INITIALIZATION ROUTINE (STABLE COMPRESSION VERSION)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LOGIN LOGIC ---
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkLogin(); });
    if (passwordInput) passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkLogin(); });

    // --- 2. THE IMAGE COMPRESSOR HANDLER ---
    // This shrinks your photo so it fits in the 1MB database limit
    const imageHandler = function() {
        const quill = this.quill;
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                console.log("Compressing image for database...");
                // Use the compressImage function already at the top of your script
                // We limit to 1000px width and 0.7 quality to keep it tiny but sharp
                const compressedBase64 = await compressImage(file, 1000, 0.7);
                
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', compressedBase64);
                console.log("Image compressed and inserted!");
            }
        };
    };

    // --- 3. INITIALIZE BILINGUAL QUILL EDITORS ---
    const toolbarOptions = {
        container: [[{ 'header': [1,2,3,false] }], ['bold', 'italic'], ['image', 'link'], [{'list': 'ordered'}, {'list': 'bullet'}]],
        handlers: { image: imageHandler }
    };

    if (typeof Quill !== 'undefined') {
        // English Editor (Achievements)
        if (document.getElementById('editor-container-en')) {
            window.quillAchievementsEN = new Quill('#editor-container-en', { 
                theme: 'snow', modules: { toolbar: toolbarOptions } 
            });
        }
        // Arabic Editor (Achievements)
        if (document.getElementById('editor-container-ar')) {
            window.quillAchievementsAR = new Quill('#editor-container-ar', { 
                theme: 'snow', modules: { toolbar: toolbarOptions } 
            });
            // Force the Arabic editor to align text to the right
            window.quillAchievementsAR.format('align', 'right');
            window.quillAchievementsAR.format('direction', 'rtl');
        }
        
        // English Editor (About Us)
        if (document.getElementById('about-editor-container-en')) {
            window.quillAboutEN = new Quill('#about-editor-container-en', { 
                theme: 'snow', modules: { toolbar: toolbarOptions } 
            });
        }
        // Arabic Editor (About Us)
        if (document.getElementById('about-editor-container-ar')) {
            window.quillAboutAR = new Quill('#about-editor-container-ar', { 
                theme: 'snow', modules: { toolbar: toolbarOptions } 
            });
            window.quillAboutAR.format('align', 'right');
            window.quillAboutAR.format('direction', 'rtl');
        }
    }
    // --- 4. START ENGINES ---
    initGSAP();
    initFirebase();
});// ==========================================
// 14. 3D INTERACTIVE MESH (WHITE GLOSSY KNOT) - CORRECTED LIGHTING
// ==========================================
const container = document.getElementById('canvas-container');

if (container) {
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 80); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; 
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    container.appendChild(renderer.domElement);

    const studioHdriUrl = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_02_1k.hdr'; 
    let knot;

    new THREE.RGBELoader().load(studioHdriUrl, function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture; 

        // التعديل هنا: سويناه مثل السيراميك اللامع جداً
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff, 
            metalness: 0.0,       // صفر حتى ما يعكس سواد الخلفية 
            roughness: 0.05,      // ناعم جداً
            clearcoat: 1.0,       // طبقة زجاجية قوية
            clearcoatRoughness: 0.0, // لمعان حاد للمناطق المضيئة
            envMapIntensity: 1.8  // الاعتماد على انعكاس الاستوديو لإبراز التفاصيل
        });

        const geometry = new THREE.TorusKnotGeometry(22, 7, 400, 100, 3, 4);
        knot = new THREE.Mesh(geometry, material);
        scene.add(knot);
    });

    // التعديل الجذري هنا: قللنا الإضاءة بشكل كبير حتى ترجع الظلال ويبين 3D
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); 
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    function animate() {
        requestAnimationFrame(animate);

        if (knot) {
            knot.rotation.x += 0.003;
            knot.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// 2. PUBLISH ACHIEVEMENT (BILINGUAL)
window.addPost = async () => {
    const titleEn = document.getElementById('post-title-en').value;
    const titleAr = document.getElementById('post-title-ar').value;
    const contentEn = window.quillAchievementsEN.root.innerHTML;
    const contentAr = window.quillAchievementsAR.root.innerHTML;
    const fileInput = document.getElementById('post-image');
    const file = fileInput ? fileInput.files[0] : null;

    if (!titleEn || !titleAr || !file) {
        alert("Please add English & Arabic titles and a cover image.");
        return;
    }

    try {
        // Compress the image so it fits safely in the database
        const compressedBase64 = await compressImage(file, 1000, 0.7);
        
        await addDoc(collection(db, "achievements"), {
            title: { en: titleEn, ar: titleAr },
            content: { en: contentEn, ar: contentAr },
            image: compressedBase64,
            date: new Date().toLocaleDateString('en-GB'),
            timestamp: Date.now()
        });

        alert("Achievement Published!");
        
        // Clear the boxes after publishing
        document.getElementById('post-title-en').value = '';
        document.getElementById('post-title-ar').value = '';
        window.quillAchievementsEN.setContents([]);
        window.quillAchievementsAR.setContents([]);
        if(fileInput) fileInput.value = '';
        
        // Reload the list below if the function exists
        if (typeof loadAdminPosts === "function") loadAdminPosts();
        
    } catch (error) {
        console.error("Error publishing: ", error);
        alert("Publish failed. Check console for details.");
    }
};

// ==========================================
// 14. BILINGUAL DISPLAY & AUTO-LOADER
// ==========================================

// --- 1. THE LANGUAGE SWITCHER ---
// Check if the user selected a language previously (defaults to English)
window.currentLang = localStorage.getItem('takamul_lang') || 'en';

window.toggleLanguage = () => {
    window.currentLang = window.currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('takamul_lang', window.currentLang); 

    if (window.currentLang === 'ar') {
        document.body.style.direction = 'rtl';
        document.body.style.textAlign = 'right';
    } else {
        document.body.style.direction = 'ltr';
        document.body.style.textAlign = 'left';
    }

    // Immediately reload ALL data on the screen in the new language
    if (document.getElementById('public-team-list')) loadPublicTeam();
    if (document.getElementById('blog-container')) loadPublicPosts();
    if (document.getElementById('public-about-content')) loadPublicAbout();
};

if (window.currentLang === 'ar') {
    document.body.style.direction = 'rtl';
    document.body.style.textAlign = 'right';
}



// Auto-apply Arabic text direction if it was saved from a previous visit
if (window.currentLang === 'ar') {
    document.body.style.direction = 'rtl';
    document.body.style.textAlign = 'right';
}

// --- 2. PUBLIC READ FUNCTIONS (SMART TRANSLATORS) ---
window.loadPublicTeam = async () => {
    const teamList = document.getElementById('public-team-list');
    if (!teamList || typeof db === 'undefined') return;

    try {
        const querySnapshot = await getDocs(collection(db, "team"));
        teamList.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Smart Reader: Looks at currentLang (en/ar) and picks the correct text
            const displayName = typeof data.name === 'object' ? data.name[window.currentLang] : data.name;
            const displayRole = typeof data.role === 'object' ? data.role[window.currentLang] : data.role;

            teamList.innerHTML += `
                <div class="team-member gs-fade-up">
                    <img src="${data.image}" alt="Team Member" class="team-photo">
                    <h3>${displayName}</h3>
                    <p style="color: var(--primary); font-weight: 600;">${displayRole}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading public team: ", error);
    }
};

window.loadPublicPosts = async () => {
    const blogContainer = document.getElementById('blog-container');
    if (!blogContainer || typeof db === 'undefined') return;

    try {
        const querySnapshot = await getDocs(collection(db, "achievements"));
        blogContainer.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Smart Reader
            const displayTitle = typeof data.title === 'object' ? data.title[window.currentLang] : data.title;
            const displayContent = typeof data.content === 'object' ? data.content[window.currentLang] : data.content;

            // Strip the HTML tags out of the rich text so we can show a clean preview
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = displayContent;
            const cleanText = tempDiv.textContent || tempDiv.innerText || "";

            blogContainer.innerHTML += `
                <div class="blog-post gs-fade-up">
                    <img src="${data.image}" alt="Cover" class="blog-post-img">
                    <div class="blog-post-content">
                        <h2>${displayTitle}</h2>
                        <small style="color:#666; margin-bottom:15px; display:block;">
                            ${window.currentLang === 'en' ? 'Published:' : 'تاريخ النشر:'} ${data.date}
                        </small>
                        <div style="color: #ccc; margin-bottom: 25px; line-height: 1.6;">
                            ${cleanText.substring(0, 130)}...
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading public posts: ", error);
    }
};

// ==========================================
// ABOUT US - READING FUNCTIONS
// ==========================================

// --- LOAD ABOUT PAGE (ADMIN) ---
window.loadAdminAbout = async () => {
    if (!document.getElementById('about-editor-container-en') || typeof db === 'undefined') return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "about_data"));
        let latestDoc = null;
        let maxTime = 0;
        
        // Scans the database and grabs your most recently saved About text
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.timestamp > maxTime) {
                maxTime = data.timestamp;
                latestDoc = data;
            }
        });

        if (latestDoc && latestDoc.content) {
            const enText = typeof latestDoc.content === 'object' ? latestDoc.content.en : latestDoc.content;
            const arText = typeof latestDoc.content === 'object' ? latestDoc.content.ar : latestDoc.content;
            
            window.quillAboutEN.root.innerHTML = enText || '';
            window.quillAboutAR.root.innerHTML = arText || '';
        }
    } catch (error) {
        console.error("Error loading admin about: ", error);
    }
};

// --- LOAD ABOUT PAGE (PUBLIC) ---
window.loadPublicAbout = async () => {
    const aboutContainer = document.getElementById('public-about-content');
    if (!aboutContainer || typeof db === 'undefined') return;

    try {
        const querySnapshot = await getDocs(collection(db, "about_data"));
        let latestDoc = null;
        let maxTime = 0;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.timestamp > maxTime) {
                maxTime = data.timestamp;
                latestDoc = data;
            }
        });

        if (latestDoc && latestDoc.content) {
            // Smart Reader: Picks English or Arabic based on the language button
            const displayContent = typeof latestDoc.content === 'object' ? latestDoc.content[window.currentLang] : latestDoc.content;
            aboutContainer.innerHTML = displayContent;
        }
    } catch (error) {
        console.error("Error loading public about: ", error);
    }
};



// ==========================================
// 15. ADMIN DASHBOARD CONTROL PANEL
// ==========================================

// --- 1. THE DELETE ENGINE ---
window.deleteDocument = async (collectionName, docId) => {
    // Add a safety check so you don't accidentally click it!
    if (confirm("Are you sure you want to permanently delete this item?")) {
        try {
            await deleteDoc(doc(db, collectionName, docId));
            alert("Item deleted successfully.");
            
            // Auto-refresh the correct list
            if (collectionName === 'achievements') loadAdminPosts();
            if (collectionName === 'team') loadAdminTeam();
            if (collectionName === 'contact') loadAdminContact();
            if (collectionName === 'custom_blocks') loadAdminBlocks();
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Failed to delete. Check console.");
        }
    }
};

// --- 2. LOAD ACHIEVEMENTS ---
window.loadAdminPosts = async () => {
    const postList = document.getElementById('admin-post-list');
    if (!postList || typeof db === 'undefined') return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "achievements"));
        if (querySnapshot.empty) {
            postList.innerHTML = '<p style="color:#666;">No achievements posted yet.</p>';
            return;
        }
        
        postList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const titleEn = typeof data.title === 'object' ? data.title.en : data.title;

            postList.innerHTML += `
                <div class="post-item-flex" style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                    <img src="${data.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 15px; border: 1px solid #ddd;">
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 5px; color: #111;">${titleEn}</h4>
                        <small style="color: #666;">Published: ${data.date || 'Recently'}</small>
                    </div>
                    <div class="admin-actions">
                        <button style="color: #10b981; background: none; border: none; cursor: pointer; font-weight: 600; margin-right: 15px;" onclick="window.open('achievement.html', '_blank')">View</button>
                        <button style="color: #3b82f6; background: none; border: none; cursor: pointer; font-weight: 600; margin-right: 15px;" onclick="alert('Edit logic coming next!')">Edit</button>
                        <button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" onclick="deleteDocument('achievements', '${doc.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) { console.error("Error loading admin posts:", error); }
};

// --- 3. LOAD TEAM ---
window.loadAdminTeam = async () => {
    const teamList = document.getElementById('admin-team-list');
    if (!teamList || typeof db === 'undefined') return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "team"));
        if (querySnapshot.empty) {
            teamList.innerHTML = '<p style="color:#666;">No team members added yet.</p>';
            return;
        }

        teamList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const nameEn = typeof data.name === 'object' ? data.name.en : data.name;
            const roleEn = typeof data.role === 'object' ? data.role.en : data.role;

            teamList.innerHTML += `
                <div class="post-item-flex" style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                    <img src="${data.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 50%; margin-right: 15px; border: 1px solid #ddd;">
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 5px; color: #111;">${nameEn}</h4>
                        <small style="color: #666;">${roleEn}</small>
                    </div>
                    <div class="admin-actions">
                        <button style="color: #10b981; background: none; border: none; cursor: pointer; font-weight: 600; margin-right: 15px;" onclick="window.open('team.html', '_blank')">View</button>
                        <button style="color: #3b82f6; background: none; border: none; cursor: pointer; font-weight: 600; margin-right: 15px;" onclick="alert('Edit logic coming next!')">Edit</button>
                        <button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" onclick="deleteDocument('team', '${doc.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) { console.error("Error loading admin team:", error); }
};

// --- 4. LOAD CONTACT INFO ---
window.loadAdminContact = async () => {
    const contactList = document.getElementById('admin-contact-list');
    if (!contactList || typeof db === 'undefined') return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "contact"));
        if (querySnapshot.empty) {
            contactList.innerHTML = '<p style="color:#666;">No contact info added yet.</p>';
            return;
        }

        contactList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const valueEn = typeof data.value === 'object' ? data.value.en : data.value;

            contactList.innerHTML += `
                <div class="post-item-flex" style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                    <div style="width: 40px; height: 40px; background: #f0f0f1; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; color: #FF5C00;">
                        ${data.type.substring(0, 1)}
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 5px; color: #111;">${data.type}</h4>
                        <small style="color: #666;">${valueEn}</small>
                    </div>
                    <div class="admin-actions">
                        <button style="color: #10b981; background: none; border: none; cursor: pointer; font-weight: 600; margin-right: 15px;" onclick="window.open('contact.html', '_blank')">View</button>
                        <button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" onclick="deleteDocument('contact', '${doc.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) { console.error("Error loading admin contact:", error); }
};
// ==========================================
// MODULAR PAGE BUILDER (CUSTOM BLOCKS)
// ==========================================
let editingBlockId = null;

// 1. Smart Save (Handles Create & Update + Position)
window.addCustomBlock = async () => {
    const titleEn = document.getElementById('block-title-en').value;
    const titleAr = document.getElementById('block-title-ar').value;
    const descEn = document.getElementById('block-desc-en').value;
    const descAr = document.getElementById('block-desc-ar').value;
    const layout = document.getElementById('block-layout').value;
    const position = document.getElementById('block-position').value; // Get Position
    const fileInput = document.getElementById('block-image');
    const file = fileInput ? fileInput.files[0] : null;

    if (!titleEn || !titleAr || !descEn || !descAr) { alert("Please fill all text fields."); return; }
    if (!editingBlockId && !file) { alert("Please select an image for the new block."); return; }

    try {
        const payload = {
            title: { en: titleEn, ar: titleAr },
            desc: { en: descEn, ar: descAr },
            layout: layout,
            position: position, // Save Position
            timestamp: Date.now()
        };

        if (file) payload.image = await compressImage(file, 1000, 0.7);

        if (editingBlockId) {
            await updateDoc(doc(db, "custom_blocks", editingBlockId), payload);
            alert("Custom Block UPDATED!");
            editingBlockId = null;
            document.getElementById('publish-block-btn').innerText = "Publish Section to Homepage";
        } else {
            await addDoc(collection(db, "custom_blocks"), payload);
            alert("Custom Block ADDED to Homepage!");
        }
        
        // Clear inputs
        document.getElementById('block-title-en').value = ''; document.getElementById('block-title-ar').value = '';
        document.getElementById('block-desc-en').value = ''; document.getElementById('block-desc-ar').value = '';
        document.getElementById('block-position').value = 'bottom';
        if(fileInput) fileInput.value = '';
        
        if (typeof loadAdminBlocks === "function") loadAdminBlocks();
        if (typeof loadPublicBlocks === "function") loadPublicBlocks();
    } catch (error) { console.error(error); }
};

// 2. Setup Edit Mode (Loads Position)
window.editCustomBlock = async (id) => {
    try {
        const snap = await getDoc(doc(db, "custom_blocks", id));
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('block-title-en').value = data.title.en || '';
            document.getElementById('block-title-ar').value = data.title.ar || '';
            document.getElementById('block-desc-en').value = data.desc.en || '';
            document.getElementById('block-desc-ar').value = data.desc.ar || '';
            document.getElementById('block-layout').value = data.layout || 'row';
            document.getElementById('block-position').value = data.position || 'bottom'; // Load Position
            
            editingBlockId = id; 
            document.getElementById('publish-block-btn').innerText = "Update Custom Block";
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) { console.error(error); }
};

// 3. Load Blocks in Admin (Shows Position label)
window.loadAdminBlocks = async () => {
    const blockList = document.getElementById('admin-blocks-list');
    if (!blockList || typeof db === 'undefined') return;
    try {
        const snap = await getDocs(collection(db, "custom_blocks"));
        blockList.innerHTML = ''; 
        
        if (snap.empty) {
            blockList.innerHTML = '<p style="color:#666;">No custom blocks added yet.</p>';
            return;
        }

        snap.forEach((doc) => {
            const data = doc.data();
            const posText = data.position === 'top' ? '<span style="color:#10b981; font-weight:bold;">Above Stages</span>' : 'Below Stages';
            blockList.innerHTML += `
                <div class="post-item-flex" style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                    <img src="${data.image}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 15px;">
                    <div style="flex: 1;">
                        <h4 style="margin-bottom: 5px; color: #111;">${data.title.en}</h4>
                        <small style="color: #666;">Layout: ${data.layout === 'row' ? 'Image Left' : 'Image Right'} | Position: ${posText}</small>
                    </div>
                    <div class="admin-actions">
                        <button style="color: #3b82f6; background: none; border: none; cursor: pointer; font-weight: 600; margin-right: 15px;" onclick="editCustomBlock('${doc.id}')">Edit</button>
                        <button style="color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600;" onclick="deleteDocument('custom_blocks', '${doc.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) { console.error(error); }
};

// 4. Render Blocks on Public Homepage (Splits Top vs Bottom)
// 4. Render Blocks on Public Homepage (Splits Top vs Bottom - NO BOX STYLE)
window.loadPublicBlocks = async () => {
    const topContainer = document.getElementById('custom-blocks-top-container');
    const bottomContainer = document.getElementById('custom-blocks-container');
    if (typeof db === 'undefined') return;
    
    try {
        const snap = await getDocs(collection(db, "custom_blocks"));
        let blocks = []; snap.forEach(d => blocks.push({id: d.id, ...d.data()}));
        blocks.sort((a,b) => a.timestamp - b.timestamp); // Sort by oldest first
        
        let topHtml = "";
        let bottomHtml = "";

        blocks.forEach(block => {
            const title = block.title[window.currentLang] || block.title.en;
            const desc = block.desc[window.currentLang] || block.desc.en;
            const pos = block.position || 'bottom'; 
            
            // THE NEW BORDERLESS "CLEAN" DESIGN
            const blockContent = `
            <div style="display: flex; flex-direction: ${block.layout}; gap: 80px; align-items: center; margin-bottom: 80px; width: 100%;">
                <div style="flex: 1; width: 100%;">
                    <img src="${block.image}" style="width: 100%; max-height: 500px; object-fit: cover; border-radius: 16px; box-shadow: 0 30px 60px rgba(0,0,0,0.6);">
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <h2 style="color: var(--primary); font-size: 3rem; margin-bottom: 25px; font-weight: 800; line-height: 1.2;">${title}</h2>
                    <p style="color: #e0e0e0; font-size: 1.15rem; line-height: 1.8; white-space: pre-wrap;">${desc}</p>
                </div>
            </div>`;

            if (pos === 'top') {
                topHtml += blockContent;
            } else {
                bottomHtml += blockContent;
            }
        });

        // Inject the HTML into the correct containers
        if (topContainer) topContainer.innerHTML = topHtml;
        if (bottomContainer) bottomContainer.innerHTML = bottomHtml;
        
    } catch (error) { console.error(error); }
};
// ==========================================
// THE MASTER AUTO-LOADER
// ==========================================
// Waits 1.2 seconds for Firebase to securely connect, then populates the screen
setTimeout(() => {
    // 1. Load Admin Dashboards
    if (document.getElementById('admin-team-list') && typeof loadAdminTeam === 'function') loadAdminTeam();
    if (document.getElementById('admin-post-list') && typeof loadAdminPosts === 'function') loadAdminPosts();
    if (document.getElementById('about-editor-container-en') && typeof loadAdminAbout === 'function') loadAdminAbout();
    if (document.getElementById('admin-contact-list') && typeof loadAdminContact === 'function') loadAdminContact();
    // Under Admin Dashboards:
    if (document.getElementById('admin-blocks-list') && typeof loadAdminBlocks === 'function') loadAdminBlocks();
    if (document.getElementById('admin-blocks-list') && typeof loadAdminBlocks === 'function') loadAdminBlocks();
    // Under Public Pages:
    if (typeof loadPublicBlocks === 'function') loadPublicBlocks();
    // 2. Load Public Pages
    if (document.getElementById('public-team-list')) loadPublicTeam();
    if (document.getElementById('blog-container')) loadPublicPosts();
    if (document.getElementById('public-about-content')) loadPublicAbout();
    
    // ADD THIS NEW LINE TO TRIGGER THE STAGE IMAGES!
    if (typeof loadStageImages === 'function') loadStageImages();
    // Under Admin Dashboards:
    if (typeof loadAdminHomeText === 'function') loadAdminHomeText();
    
    // Under Public Pages:
    if (typeof loadPublicHomeText === 'function') loadPublicHomeText();
}, 1200);

// ==========================================
// STAGES IMAGES CHANGER
// ==========================================

window.updateStageImage = async (stageNumber) => {
    const fileInput = document.getElementById(`stage${stageNumber}-upload`);
    const file = fileInput.files[0];

    if (!file) {
        alert(`Please select an image for Stage 0${stageNumber} first.`);
        return;
    }

    try {
        // Compress the image so it loads lightning fast (800px width)
        const compressedBase64 = await compressImage(file, 800, 0.7);

        // Save it to Firebase using { merge: true } so we don't accidentally delete other stages!
        await setDoc(doc(db, "settings", "stages"), {
            [`stage${stageNumber}`]: compressedBase64,
            updatedAt: Date.now()
        }, { merge: true });

        alert(`Stage 0${stageNumber} image updated successfully! Refresh your home page to see it.`);
        fileInput.value = ''; // clear input
    } catch (error) {
        console.error("Error updating stage image: ", error);
        alert("Failed to update image. Check console.");
    }
};

window.loadStageImages = async () => {
    // Only run this script if the user is currently on the home page looking at the stages
    if (!document.getElementById('stage-img-1') || typeof db === 'undefined') return;

    try {
        const docSnap = await getDoc(doc(db, "settings", "stages"));
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Replace the static Unsplash images with your uploaded database images!
            if (data.stage1) document.getElementById('stage-img-1').src = data.stage1;
            if (data.stage2) document.getElementById('stage-img-2').src = data.stage2;
            if (data.stage3) document.getElementById('stage-img-3').src = data.stage3;
            if (data.stage4) document.getElementById('stage-img-4').src = data.stage4;
        }
    } catch (error) {
        console.error("Error loading stage images:", error);
    }
};
// ==========================================
// HOMEPAGE FLOATING TEXT ENGINE (BILINGUAL)
// ==========================================
const corners = ['tl', 'tr', 'bl', 'br'];

// 1. Save data from Admin Dashboard
window.saveHomeText = async () => {
    const payload = {};
    corners.forEach(pos => {
        payload[pos] = {
            title: {
                en: document.getElementById(`ht-${pos}-title-en`).value || '',
                ar: document.getElementById(`ht-${pos}-title-ar`).value || ''
            },
            desc: {
                en: document.getElementById(`ht-${pos}-desc-en`).value || '',
                ar: document.getElementById(`ht-${pos}-desc-ar`).value || ''
            }
        };
    });
    
    try {
        await setDoc(doc(db, "settings", "hometext"), { ...payload, updatedAt: Date.now() });
        alert("Homepage Text Saved Successfully!");
    } catch (e) { console.error("Error saving home text:", e); alert("Failed to save."); }
};

// 2. Load data into Admin Dashboard boxes
window.loadAdminHomeText = async () => {
    if (!document.getElementById('ht-tl-title-en') || typeof db === 'undefined') return;
    try {
        const snap = await getDoc(doc(db, "settings", "hometext"));
        if (snap.exists()) {
            const data = snap.data();
            corners.forEach(pos => {
                if(data[pos]) {
                    document.getElementById(`ht-${pos}-title-en`).value = data[pos].title.en || '';
                    document.getElementById(`ht-${pos}-title-ar`).value = data[pos].title.ar || '';
                    document.getElementById(`ht-${pos}-desc-en`).value = data[pos].desc.en || '';
                    document.getElementById(`ht-${pos}-desc-ar`).value = data[pos].desc.ar || '';
                }
            });
        }
    } catch (e) { console.error("Error loading admin home text:", e); }
};

// 3. Load data to the Public Website (with AR/EN toggle support)
window.loadPublicHomeText = async () => {
    if (!document.getElementById('text-tl-title') || typeof db === 'undefined') return;
    try {
        const snap = await getDoc(doc(db, "settings", "hometext"));
        if (snap.exists()) {
            const data = snap.data();
            corners.forEach(pos => {
                if(data[pos]) {
                    const titleEl = document.getElementById(`text-${pos}-title`);
                    const descEl = document.getElementById(`text-${pos}-desc`);
                    if(titleEl) titleEl.innerText = data[pos].title[window.currentLang] || data[pos].title.en;
                    if(descEl) descEl.innerText = data[pos].desc[window.currentLang] || data[pos].desc.en;
                }
            });
        }
    } catch (e) { console.error("Error loading public home text:", e); }
};