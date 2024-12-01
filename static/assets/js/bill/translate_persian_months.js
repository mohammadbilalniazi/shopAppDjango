
    async function nativeSelector() {
        var elements = document.querySelectorAll("body, body *");
        var results = [];
        var child;
        for(var i = 0; i < elements.length; i++) {
            child = elements[i].childNodes[0];
            if(elements[i].hasChildNodes() && child.nodeType == 3) {
                results.push(child);
            }
        }
        return results;
    }
    
    // document.getElementById("start_date_input").addEventListener("keypress",async (e)=>{
    async function  mappTranslation() 
    {
      var textnodes =await nativeSelector(),
        _nv;
        var translations={جدی:"حمل"}
        
        for (var i = 0, len = textnodes.length; i<len; i++){
            _nv = textnodes[i].nodeValue;
            var index=Object.keys(translations).indexOf(textnodes[i].nodeValue)
            console.log(index,textnodes[i].nodeValue,translations[textnodes[i].nodeValue]);
            if(index!==-1)
            {
                // alert(word)
            var word=textnodes[i].nodeValue
            textnodes[i].nodeValue = _nv.replace(word,translations[word]);
            }
        }    
    }
    // });
    