// nav
$(document).on('click','#nav-area a',function(){
    var text = $(this).text();
    if(text == '赛程'){
        $('#schedule').show();
        $('#star-card').hide();
        $('#rank').hide();
        $('#competition').hide();
    }else if(text == '球星'){
        $('#star-card').show();
        $('#schedule').hide();
        $('#rank').hide();
        $('#competition').hide();
    }else if(text == '排名'){
        $('#rank').show();
        $('#schedule').hide();
        $('#star-card').hide();
        $('#competition').hide();
    }else if(text == '比试'){
        $('#competition').show();
        $('#schedule').hide();
        $('#star-card').hide();
        $('#rank').hide();
    }
});
// 切换球队球员排名背景图片
$(document).on('click','#team-select',function(){
    $('#team-select').css('background', 'url("./images/bg.png") 4px 0 no-repeat');
    $('#player-select').css('background', 'url("./images/bg.png") -90px 0 no-repeat');
});
$(document).on('click','#player-select',function(){
    $('#player-select').css('background', 'url("./images/bg.png") 4px 0 no-repeat');
    $('#team-select').css('background', 'url("./images/bg.png") -90px 0 no-repeat');
});
$(document).on('click','#team-compare',function(){
    $('#team-compare').css('background', 'url("./images/bg.png") 4px 0 no-repeat');
    $('#player-compare').css('background', 'url("./images/bg.png") -90px 0 no-repeat');
});
$(document).on('click','#player-compare',function(){
    $('#player-compare').css('background', 'url("./images/bg.png") 4px 0 no-repeat');
    $('#team-compare').css('background', 'url("./images/bg.png") -90px 0 no-repeat');
});