const player = {
    tracks: [
        {
            title: 'Stuck in the moment',
            artist: 'Justin Bieber',
            cover: 'album.jpg',
            url: 'https://example.com/track1.mp3'
        },
        {
            title: 'We Don t Talk Anymore',
            artist: 'Charlie Puth',
            cover: 'album 2.webp',
            url: 'https://example.com/track2.mp3'
        },
        {
            title: 'Upper Echelon',
            artist: 'Travis Scott',
            cover: 'album3.jpg',
            url: 'https://example.com/track3.mp3'
        }
    ],
    currentTrackIndex: 0,
    isPlaying: false,
    audio: new Audio(),
    shuffle: false,
    repeat: false,

    init() {
        // Cache DOM elements
        this.elements = {
            play: document.getElementById('play'),
            next: document.getElementById('next'),
            prev: document.getElementById('prev'),
            shuffle: document.getElementById('shuffle'),
            repeat: document.getElementById('repeat'),
            volume: document.getElementById('volume'),
            volumeIcon: document.getElementById('volume-icon'),
            progress: document.getElementById('progress'),
            progressBar: document.getElementById('progress-bar'),
            currentTime: document.getElementById('current-time'),
            duration: document.getElementById('duration'),
            playlist: document.getElementById('playlist'),
            coverArt: document.getElementById('cover-art'),
            currentTitle: document.getElementById('current-title'),
            currentArtist: document.getElementById('current-artist'),
            searchBox: document.querySelector('.search-box')
        };

        this.bindEvents();
        this.loadTrack(0);
        this.renderPlaylist();
    },

    bindEvents() {
        
        this.elements.play.onclick = () => this.togglePlay();
        this.elements.next.onclick = () => this.nextTrack();
        this.elements.prev.onclick = () => this.prevTrack();
        this.elements.shuffle.onclick = () => this.toggleShuffle();
        this.elements.repeat.onclick = () => this.toggleRepeat();

        
        this.elements.volume.oninput = (e) => this.setVolume(e.target.value);
        this.elements.volumeIcon.onclick = () => this.toggleMute();

        this.elements.progressBar.onclick = (e) => {
            const clickPosition = e.offsetX / this.elements.progressBar.offsetWidth;
            const clickTime = clickPosition * this.audio.duration;
            this.audio.currentTime = clickTime;
        };

        this.audio.ontimeupdate = () => this.updateProgress();
        this.audio.onended = () => this.handleTrackEnd();

        
        this.elements.searchBox.oninput = (e) => this.handleSearch(e.target.value);

        document.onkeydown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
            if (e.code === 'ArrowRight') this.nextTrack();
            if (e.code === 'ArrowLeft') this.prevTrack();
        };
    },

    loadTrack(index) {
        this.currentTrackIndex = index;
        const track = this.tracks[index];

        this.elements.currentTitle.textContent = track.title;
        this.elements.currentArtist.textContent = track.artist;
        this.elements.coverArt.src = track.cover;

        this.audio.src = track.url;
        this.updatePlaylist();
    },

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.elements.play.innerHTML = this.isPlaying ?
            '<i class="fas fa-pause"></i>' :
            '<i class="fas fa-play"></i>';
    },

    nextTrack() {
        if (this.shuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * this.tracks.length);
            } while (nextIndex === this.currentTrackIndex);
            this.loadTrack(nextIndex);
        } else {
            const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
            this.loadTrack(nextIndex);
        }
        if (this.isPlaying) this.audio.play();
    },

    prevTrack() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            const prevIndex = this.currentTrackIndex === 0 ?
                this.tracks.length - 1 :
                this.currentTrackIndex - 1;
            this.loadTrack(prevIndex);
        }
        if (this.isPlaying) this.audio.play();
    },

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        this.elements.shuffle.classList.toggle('active');
    },

    toggleRepeat() {
        this.repeat = !this.repeat;
        this.elements.repeat.classList.toggle('active');
    },

    setVolume(value) {
        this.audio.volume = value / 100;
        this.updateVolumeIcon(value);
    },

    updateVolumeIcon(value) {
        const icon = this.elements.volumeIcon;
        icon.className = 'fas ' + (
            value == 0 ? 'fa-volume-mute' :
                value < 30 ? 'fa-volume-off' :
                    value < 70 ? 'fa-volume-down' :
                        'fa-volume-up'
        );
    },

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.elements.volumeIcon.className = 'fas ' +
            (this.audio.muted ? 'fa-volume-mute' : 'fa-volume-up');
    },

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.elements.progress.style.width = `${progress}%`;
            this.elements.currentTime.textContent = this.formatTime(this.audio.currentTime);
            this.elements.duration.textContent = this.formatTime(this.audio.duration);
        }
    },

    handleTrackEnd() {
        if (this.repeat) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.nextTrack();
        }
    },

    renderPlaylist() {
        this.elements.playlist.innerHTML = this.tracks
            .map((track, index) => `
                <div class="track-item ${index === this.currentTrackIndex ? 'active' : ''}" 
                     onclick="player.loadTrack(${index}); player.togglePlay();">
                    <img src="${track.cover}" alt="${track.title}">
                    <div class="track-info">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                    </div>
                </div>
            `).join('');
    },

    updatePlaylist() {
        const trackItems = this.elements.playlist.children;
        Array.from(trackItems).forEach((item, index) => {
            item.classList.toggle('active', index === this.currentTrackIndex);
        });
    },

    handleSearch(query) {
        const searchTerm = query.toLowerCase();
        const trackItems = this.elements.playlist.children;

        Array.from(trackItems).forEach((item, index) => {
            const track = this.tracks[index];
            const matchesSearch =
                track.title.toLowerCase().includes(searchTerm) ||
                track.artist.toLowerCase().includes(searchTerm);

            item.style.display = matchesSearch ? 'flex' : 'none';
        });
    }
};


window.onload = () => player.init();







