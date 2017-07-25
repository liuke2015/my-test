               function tco(f) {
  				var value;
			    var active = false;
			  	var accumulated = [];
			
			  	return function accumulator() {
			   		 accumulated.push(arguments);
			    		if (!active) {
					      active = true;
					      while (accumulated.length) {
					        value = f.apply(this, accumulated.shift());
					        console.log("value="+value);
					      }
					      active = false;
					      return value;
					    }
					  };
					}

					var sum = tco(function(x, y) {
					  if (y > 0) {
					    return sum(x + 1, y - 1)
					  }
					  else {
					    return x
					  }
					});
					
					var tot=sum(1, 5);
					console.log(tot);