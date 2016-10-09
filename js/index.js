/**
 * Created by yy on 2016/9/29.
 */
$(function () {
    var canvas = $('#canvas').get(0);
    var ctx = canvas.getContext('2d');
    var ROW = 15;
    var width = canvas.width;
    var off = width / ROW;
    var ai = false;

    function p2k(x,y) {
        return x+'_'+y;
    }

    var blank={};
    for(var i=0;i<ROW;i++){
        for(var j=0;j<ROW;j++){
            blank[p2k(i,j)]=true;
        }
    }

    console.log(blank);

    function draw() {
        function qipan() {
            ctx.beginPath();
            for(var i=0;i<ROW;i++){
                ctx.moveTo(off/2+0.5,off/2+0.5+i*off);
                ctx.lineTo((ROW-0.5)*off+0.5,off/2+0.5+i*off);
                ctx.moveTo(off/2+0.5+i*off,off/2+0.5);
                ctx.lineTo(off/2+0.5+i*off,(ROW-0.5)*off+0.5);
            }

            ctx.stroke();
            ctx.closePath();
        }
        qipan();

        function drawcircle(x,y) {
            ctx.beginPath();
            ctx.arc(x*off+0.5,y*off+0.5,4,0,Math.PI*2);
            ctx.fill();
            ctx.closePath();
        }

        drawcircle(3.5,3.5);
        drawcircle(11.5,3.5);
        drawcircle(3.5,11.5);
        drawcircle(11.5,11.5);
        drawcircle(7.5,7.5);
    }
    
    draw();
    var blocks = {};
    function v2k(position) {
        return position.x+'_'+position.y;
    }


    function k2o(key) {
        var arr = key.split('_');
        return {x:parseInt(arr[0]),y:parseInt(arr[1])};
    }

    function drawchess(position,color) {
        ctx.save();

        ctx.beginPath();
        ctx.translate(
            (position.x+0.5)*off+0.5,
            (position.y+0.5)*off+0.5
        );
        if(color =='black'){
            // ctx.fillStyle ='#000';
            var r = ctx.createRadialGradient(-2,-2,2,-5,-5,15);
            r.addColorStop(0,'#fff');
            r.addColorStop(0.5,'#555');
            r.addColorStop(1,'#000');
            ctx.fillStyle = r;
        }else if(color == 'white'){
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 2;
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.fillStyle ='#fff';
        }

        ctx.arc(0,0,15,0,Math.PI*2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        blocks[position.x+'_'+position.y] = color;
        delete  blank[v2k(position)];
    }

    var hei = $('.hei');
    var bai = $('.bai');

    function check(position,color) {
        var numx=1;
        var numy=1;
        var numl=1;
        var numr=1;
        var table={};
        for(var i in blocks){
            if(blocks[i]==color){
                table[i]=true;
            }
        }
        //横
        var tx=position.x;
        var ty=position.y;
        while(table[p2k(tx+1,ty)]){
            numx++;
            tx++;
        }

        var tx=position.x;
        var ty=position.y;
        while(table[p2k(tx-1,ty)]){
            numx++;
            tx--;
        }
        //竖
        var tx=position.x;
        var ty=position.y;
        while(table[p2k(tx,ty+1)]){
            numy++;
            ty++;
        }

        var tx=position.x;
        var ty=position.y;
        while(table[p2k(tx,ty-1)]){
            numy++;
            ty--;
        }
        //左斜
        var tx=position.x;
        var ty=position.y;
        while(table[p2k(tx-1,ty+1)]){
            numl++;
            tx--;
            ty++;
        }

        var tx=position.x;
        var ty=position.y;
        while(table[p2k(tx+1,ty-1)]){
            numl++;
            tx++;
            ty--;
        }
        //右斜
        var tx=position.x;
        var ty=position.y;
        while(table[p2k(tx+1,ty+1)]){
            numr++;
            tx++;
            ty++;
        }

        var tx=position.x;
        var ty=position.y;
        while(table[p2k(tx-1,ty-1)]){
            numr++;
            tx--;
            ty--;
        }

        return Math.max(numx,numy,numl,numr);
    }

    function drawtext(pos,text,color) {
        ctx.save();
        ctx.font = '15px 微软雅黑';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if(color=='black'){
            ctx.fillStyle='#fff';
        }else if(color=='white'){
            ctx.fillStyle='#000';
        }
        ctx.fillText(text,(pos.x+0.5)*off,(pos.y+0.5)*off);
        ctx.restore();

    }

    function review() {
        var i=1;
        for(var pos in blocks){
            drawtext(k2o(pos),i,blocks[pos]);
            i++;
        }
    }
    
    var flag = true;

    var ren = $('.ren');
    var renji = $('.renji');

    $('.ai').on('click',function () {
        restart();
        renji.show();

        setTimeout(function () {
            renji.addClass('active');
            renji.hide('slow');
        },1000)

        ai = true;
    })
    $('.two').on('click',function () {
        restart();
        ren.show();

        setTimeout(function () {
            ren.addClass('active');
            ren.hide();
        },1000)
        ai = false;
    })

    function AI() {
        //遍历所有的空白位置
        var max1 = -Infinity;
        var max2 = -Infinity;
        var pos1;
        var pos2;
        for(var i in blank){
           var score1 = check(k2o(i),'black');
            console.log(score1);
            var score2 = check(k2o(i),'white');
           if(score1>max1){
               max1 = score1;
               pos1 = k2o(i);
           }
            if(score2>max2){
                max2 = score2;
                pos2 = k2o(i);
            }
        }
        if(max1>=max2){
            return pos1;
        }else{
            return pos2;
        }
        // return {x:5,y:5};
    }

    function handlclick(e) {
        var position = {
            x:Math.round((e.offsetX-off/2)/off),
            y:Math.round((e.offsetY-off/2)/off)
        };
        // console.log(position);

        if(blocks[v2k(position)]){
            return;
        }

        if(ai){
            drawchess(position,'black');
            drawchess(AI(),'white');
            if(check(position,'black')>=5){
                alert('黑棋赢');
                // hei.show();
                $(canvas).off('click');
                if(confirm('是否生成棋谱')){
                    review();
                }
                return;
            }
            if(check(AI(),'white')>5){
                alert('白棋赢');
                // bai.show();
                $(canvas).off('click');
                if(confirm('是否生成棋谱')){
                    review();
                }
                return;
            }
            return;
        }

        if(flag){
            drawchess(position,'black');
            if(check(position,'black')>=5){
                alert('黑棋赢');
                // hei.show();
                $(canvas).off('click');
                if(confirm('是否生成棋谱')){
                    review();
                }
                return;
            }
            flag = false;
        }else {
            drawchess(position,'white');
            if(check(position,'white')>=5){
                alert('白棋赢');
                // bai.show();
                $(canvas).off('click');
                if(confirm('是否生成棋谱')){
                    review();
                }
                return;
            }
            flag = true;
        }
    }

    $(canvas).on('click',handlclick);

    function restart() {
        ctx.clearRect(0,0,width,width);
        flag=true;
        blocks={};
        blank={};
        for(var i=0;i<ROW;i++){
            for(var j=0;j<ROW;j++){
                blank[p2k(i,j)]=true;
            }
        }
        $(canvas).off('click').on('click',handlclick);
        draw();
    }


    $('.start').on('click',function () {
        restart();
    })

    var bg1 = $('.bg1');
    var begin = $('.bg1 .begin');
    var bg2 = $('.bg2');
    var anniu = $('.anniu');
    var he = $('.he');
    var $biao = $('#biao');

    begin.on('click',function () {
        bg1.hide();
        bg2.show();
        $('#canvas').show();
        anniu.show();
        he.show();
        $biao.show();
    })


    var biao = $('#biao').get(0);
    var ctx2 = biao.getContext('2d');



    function clock() {
        ctx2.clearRect(0,0,200,200);
        ctx2.save();
        var data = new Date();
        var s= data.getSeconds();
        ctx2.translate(100,100);
        ctx2.rotate(2*Math.PI*s/60);
        ctx2.beginPath();
        ctx2.moveTo(0,0);
        ctx2.lineTo(0,-70);
        ctx2.moveTo(0,0);
        ctx2.stroke();
        ctx2.closePath();

        ctx2.restore();

    }
    setInterval(clock,1000);


})