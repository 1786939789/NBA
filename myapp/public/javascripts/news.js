//nav-area-black
var nav_area_black = new Vue({
    el: '#nav-area-black',
    data: {
        username: ''
    },
    created: function () {
        var storage = window.localStorage;
        this.username = storage.getItem('username');
    },
    mounted: function(){

    },
    methods: {
        user_info: function(){
            //个人信息
        },
        exit: function () {
            window.location.href = 'homePage.html';
        }
    }
});
var news = new Vue({
    el: '#news',
    data: {
        title: '',
        img_src: [],
        content: [],
        num: 0,
    },
    created: function(){
        var storage = window.localStorage;
        this.title = storage.getItem('title');
        this.img_src = storage.getItem('imgUrls').split(';');
        this.content = storage.getItem('urlContent').split('$');
        this.num =  Math.floor(this.content.length / this.img_src.length);
    },
    methods: {
        
    },
});