var bus = new Vue();
Vue.prototype.bus = bus;
//nav-area-black
var nav_area_black = new Vue({
    el: '#nav-area-black',
    data: {
        username: ''
    },
});
var player = new Vue({
    el: '#player',
    data: {
        check_player_name: '',
        player_data_rank: [],
        player_data_career_regular: [],
        player_data_career_off: [],
    },
    created: function(){
        var that = this;
        var storage = window.localStorage;
        this.check_player_name = storage.getItem('check_player_name');
        $.get('/tab/player', 'check_player_name='+that.check_player_name, function(results){
            if(results.status == 'ok'){
                that.player_data_rank = results.player_data_rank;
                var first = -1, second = -1; //第一二次出现赛季字符串
                for(var i=0; i<results.player_data_career.length; ++i){
                    if(results.player_data_career[i][0] == '赛季'){
                        if(first == -1){
                            first = i;
                        }else{
                            second = i;
                            that.player_data_career_regular = results.player_data_career.slice(first, i);
                            that.player_data_career_off = results.player_data_career.slice(i, results.player_data_career.length);
                        }
                    }
                }
                // 只出现一次赛季
                if(second == -1)
                    that.player_data_career_regular = results.player_data_career.slice(first, results.player_data_career.length);
            }
            $('#loading').hide();
        });
    },
    methods: {
        
    },
});