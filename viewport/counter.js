/* Counter.js

ELEMENT that is passed in to counter
-------------------------------------------------------------------------------
<div class="big-counter counter clearfix">
        <h2>TOTAL PLEDGES</h2>
        <ul>
            <li class="hundred-thousands">
                <div class="top">0</div>
                <div class="bottom">0</div>
                <div class="flip-top">0</div>
                <div class="flip-bottom">0</div>
            </li>
            <li class="ten-thousands">
                <div class="top">0</div>
                <div class="bottom">0</div>
                <div class="flip-top">0</div>
                <div class="flip-bottom">0</div>
            </li>
            <li class="thousands">
                <div class="top">0</div>
                <div class="bottom">0</div>
                <div class="flip-top">0</div>
                <div class="flip-bottom">0</div>
            </li>
            <li class="hundreds">
                <div class="top">0</div>
                <div class="bottom">0</div>
                <div class="flip-top">0</div>
                <div class="flip-bottom">0</div>
            </li>
            <li class="tens">
                <div class="top"></div>
                <div class="bottom"></div>
                <div class="flip-top"></div>
                <div class="flip-bottom"></div>
            </li>
            <li class="ones">
                <div class="top"></div>
                <div class="bottom"></div>
                <div class="flip-top"></div>
                <div class="flip-bottom"></div>
            </li>
        </ul>
    </div>
-------------------------------------------------------------------------------*/

(function(global){
    function counter(element){
      element = $(element);

      var flipInProgress = false;
      var pendingFlips = 0;
      var defaultFlipDelay = 100;
      var alwaysFlip = false; // set to true if you want all digits to flip even when they don't change.
      var currentNum = "";
      var digits = [];

      var _topHeight = element.find("ul").height() / 2;
      
      //save references to digits
      var liArr = element.find("ul li");
      var liLength = liArr.length;


      for(var i = 0; i < liLength; i++){
        digits[i] = -1;
      }

      var padZeros = function(number){
        var str = ""+number;
        while(str.length < liLength){
          str = "0" + str;
        }
        return str;
      }

      //**********************************************************************************************
      var update = function(_num, callback, delay){
        var numObjects = [];
        var num = ""+_num;

        if(num == currentNum) {
          // number hasn't changed
          return;
        }

        if(flipInProgress){
          // don't re-start animations.
          return;
        }

        currentNum = num;

        num = padZeros(num);

        var numArr = num.split("");
        var numLength = numArr.length;

        for(var i=0; i< numLength; i++){
          numObjects.push({li:liArr[i], num: numArr[i]});
        }

        for(var z=numLength; z < liLength; z++){
          numObjects.push({li:liArr[z], num:""});
        }

        flipNumbers(numObjects, callback, delay);
      };

      var flipNumbers = function(numberArray, callBack, delay){
        function flipNum(obj){
          if(!delay){
            delay = defaultFlipDelay;
          }

          //*******************************************
          var element = $(obj.li);
          var num = obj.num;

          var flipDelay = delay;

          var top = element.find('div.top');
          var bottom = element.find('div.bottom');
          var flipTop = element.find('div.flip-top');
          //flipTop.hide();
          var flipBottom = element.find("div.flip-bottom");

          if(num === ""){
            flipTop.html(num);
            flipBottom.html(num);
            top.html(num);
            bottom.html(num);
            
            if(numberArray.length){
               flipNum(numberArray.shift());
             }else{
               if(callBack) callBack();
             }

            return;
          }

          if(alwaysFlip || (digits[numberArray.length] != num)){
            
            pendingFlips++;
            flipInProgress = true;
            digits[numberArray.length] = num;

            bottom.css('top','-'+_topHeight+'px');
            top.stop().animate({
                height: '0'
            }, 200, 'easeInQuad', function(){
                 top.html(num);
                 top.height(_topHeight);
                 bottom.stop().animate({top: '0'}, 400, 'easeOutBounce', function(){
                     flipBottom.html(num);
                     pendingFlips--;
                     if(pendingFlips <= 0){
                        flipInProgress = false;
                     }
                 });
            });
          } else {
            flipDelay = 0;
          }
            
          if(numberArray.length){
             setTimeout(function(){
               flipNum(numberArray.shift());
             }, flipDelay);
           }else{
             if(callBack) callBack();
           }

            flipTop.html(num);
            bottom.html(num);
          //********************************************
          
        }
        
        flipNum(numberArray.shift());
      };
      
      return {
        update: update
      };
    }

    window.global = window.global || {};
    window.global.instrument = window.global.instrument || {};
    window.global.instrument.counter = counter;
})(window);