const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const volume = $('#volume');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    currentVolume: 1,
    listenedSongs: [],
    currentIndexList: 1,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: "Nevada",
            singer: "Cozi Zuehlsdorff, Vicetone",
            path: "./music/Vicetone - Nevada (ft. Cozi Zuehlsdorff).mp4",
            image: "https://i.ytimg.com/vi/ycOm6wFxMhQ/maxresdefault.jpg"
        },
        {
            name: "Summertime",
            singer: "K-391",
            path: "./music/K-391 - Summertime [Sunshine].mp4",
            image:
                "https://i.ytimg.com/vi/25N1pdzvp4c/maxresdefault.jpg"
        },
        {
            name: "Electro House",
            singer: "K-391",
            path: "music/K-391 - Electro House 2012.mp4",
            image: "https://i.ytimg.com/vi/ULo95Mm_s20/maxresdefault.jpg"
        },
        {
            name: "Tieng Phao Tien Nguoi",
            singer: "Hung Quan",
            path:
                "./music/TIENG PHAO TIEN NGUOI - HUNG QUAN - OFFICIAL MUSIC VIDEO.mp4",
            image:
                "https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/b/7/8/5/b7853b339822edbda2293f9dd9177118.jpg"
        },
        {
            name: "Nevada",
            singer: "Cozi Zuehlsdorff, Vicetone",
            path: "./music/Vicetone - Nevada (ft. Cozi Zuehlsdorff).mp4",
            image: "https://i.ytimg.com/vi/ycOm6wFxMhQ/maxresdefault.jpg"
        },
        {
            name: "Summertime",
            singer: "K-391",
            path: "./music/K-391 - Summertime [Sunshine].mp4",
            image:
                "https://i.ytimg.com/vi/25N1pdzvp4c/maxresdefault.jpg"
        },
        {
            name: "Electro House",
            singer: "K-391",
            path: "music/K-391 - Electro House 2012.mp4",
            image: "https://i.ytimg.com/vi/ULo95Mm_s20/maxresdefault.jpg"
        },
        {
            name: "Tieng Phao Tien Nguoi",
            singer: "Hung Quan",
            path:
                "./music/TIENG PHAO TIEN NGUOI - HUNG QUAN - OFFICIAL MUSIC VIDEO.mp4",
            image:
                "https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/b/7/8/5/b7853b339822edbda2293f9dd9177118.jpg"
        },
    ],
    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    // Cách viết method như dưới đây là dùng Enhanced object literals
    render() {
        var htmls = this.songs.map((song, index) => `
            <div class="song" data-indexne="${index}">
                <div class="thumb" style="background-image: 
                        url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        `);
        htmls = htmls.join('');
        playlist.innerHTML = htmls;
    },

    handleEvents() {
        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity,
        });
        cdThumbAnimate.pause();

        // Xử lý phóng to/thu nhỏ CD
        const cdWidth = cd.offsetWidth;
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            let newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý khi click play
        playBtn.onclick = () => {
            if (app.isPlaying) audio.pause();
            else audio.play();
        }

        // Khi song dc play
        audio.onplay = function () {
            this.volume = app.currentVolume;
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause
        audio.onpause = () => {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration)
                progress.value = (audio.currentTime / audio.duration * 100).toFixed(2);
        };

        // Xử lý khi tua song
        progress.oninput = function (e) {
            let seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
        };

        // Xử lý khi change volume
        volume.oninput = () => {
            audio.volume = volume.value / 100;
            app.setConfig('currentVolume', audio.volume);
        }

        // Xử lý khi next song
        nextBtn.onclick = function () {
            if (app.isRandom) app.playRandomSong();
            else app.nextSong();
            app.scrollToActiveSong();
            audio.play();
        };

        // Xử lý khi prev song
        prevBtn.onclick = function () {
            if (app.isRandom) app.playRandomSong();
            else app.prevSong();
            app.scrollToActiveSong();
            audio.play();
        };

        // Xử lý bật / tắt random song
        randomBtn.onclick = function () {
            // Ban đầu chưa có active và isRamndom = false, khi click random sẽ đảo ngược cả 2
            this.classList.toggle('active');
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
        }

        // Xử lý bật / tắt repeat song - giống random song
        repeatBtn.onclick = function () {
            // Ban đầu chưa có active và isRamndom = false, khi click random sẽ đảo ngược cả 2
            this.classList.toggle('active');
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
        }

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (app.isRepeat) audio.play();
            else nextBtn.click();
        }

        // Xử lý play song when click
        playlist.onclick = function (e) {
            // console.log(e.target)
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option'))
                if (e.target.closest('.option')) {
                    // Xử lý option
                }
                else {
                    // songNode.getAttribute('data-indexne') bằng với songNode.dataset.indexne
                    app.currentIndex = +songNode.dataset.indexne;
                    app.loadCurrentSong();
                    audio.play();
                }
        }

    },

    loadCurrentSong() {
        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        [...$$('.song')].map((s, index) => {
            s.classList.remove('active');
            if (index == this.currentIndex) s.classList.add('active');
        });
        this.setConfig('currentIndex', this.currentIndex);
    },

    loadConfig() {
        this.isRandom = this.config.isRandom || this.isRandom;
        this.isRepeat = this.config.isRepeat || this.isRepeat;
        this.currentIndex = this.config.currentIndex || this.currentIndex;
        this.currentVolume = this.config.currentVolume || this.currentVolume;

        // cách 2 không an toàn vì sau này có thể có những cái key không mong muốn được đưa vào this
        // Object.assign(this, this.config);
    },

    nextSong() {
        this.currentIndex++;
        if (this.currentIndex > this.songs.length - 1)
            this.currentIndex = 0;
        this.loadCurrentSong();
    },

    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0)
            this.currentIndex = this.songs.length - 1;
        this.loadCurrentSong();
    },

    playRandomSong() {
        let newIndex;
        let lenSongs = this.songs.length;

        if (!this.listenedSongs.length == 0) {
            if (this.currentIndexList < lenSongs) {
                this.currentIndex = this.listenedSongs[this.currentIndexList++];
                this.loadCurrentSong();
                return;
            }
            else {
                this.currentIndexList = 0;
                this.listenedSongs = [];
            }
        }
        if (this.listenedSongs.length == 0) {
            this.listenedSongs.push(this.currentIndex);
            // Số lượng phần tử thay đổi liên tục nên không thể dùng biến có số cố định
            while (this.listenedSongs.length < lenSongs) {
                newIndex = Math.floor(Math.random() * lenSongs);
                if (!this.listenedSongs.includes(newIndex))
                    this.listenedSongs.push(newIndex);
            }
            this.currentIndex = this.listenedSongs[1];
            this.loadCurrentSong();
            console.log(this.listenedSongs);
        }
    },

    scrollToActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 200)
    },

    start() {
        // Gán cấu hình từ config vào app
        this.loadConfig();

        // Render playlist
        this.render();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Tải thông tin bài hất đầu tiên vào UI khi chạy app
        this.loadCurrentSong();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();

        // Hiển thị trạng thái ban đầu của button Repeat và Random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
        volume.value = this.currentVolume * 100;
    },
}
/** Các bước thực hiện:
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek (tua)
 * 4. CD rotate
 * 5. Next / Prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

app.start();

/** Nhiệm vụ còn lại:
1. Hạn chế tối đa các bài hát bị lặp lại
=> Xử lý phần lớn nằm trong hàm playRandomSong()

2. Fix lỗi khi tua bài hát, click giữ một chút sẽ thấy lỗi, 
vì event updatetime nó liên tục chạy dẫn tới lỗi
=> Thay onchange thành oninput.
Tip: This event is similar to the oninput event. The difference is that the oninput 
event occurs immediately after the value of an element has changed, while onchange 
occurs when the element loses focus, after the content has been changed. The other 
difference is that the onchange event also works on <select> elements.

3. Fix lỗi khi next tới 1-3 bài đầu danh sách thì không “scroll into view”
=> Sửa thành block: 'center', trong function scrollToActiveSong là được.

4. Lưu lại vị trí bài hát đang nghe, F5 lại ứng dụng không bị quay trở về bài đầu tiên
=> Bỏ this.setConfig('currentIndex', this.currentIndex); vào function loadCurrentSong()

5. Thêm chức năng điều chỉnh âm lượng, lưu vị trí âm lượng người dùng đã chọn. Mặc định 100%
=> volume.oninput = () => audio.volume = volume.value / 100;
Các lines khác có sử dụng currentVolume

6. (tự thêm): thay đổi active mà không cần render lại toàn bộ web
[...$$('.song')].map((s, index) => {
            s.classList.remove('active');
            if (index == this.currentIndex) s.classList.add('active');
        });
*/













