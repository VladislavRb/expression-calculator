function eval() {
    // Do not use eval!!!
    return;
}

function check(str, bracketsConfig) {
    function containsSimilarBrackets(brConf){
      if(brConf.every(x => x.length == 2)){
        return !brConf.every(x => x[0] != x[1]);
      }
      else{
        return false;
      }
    }
  
    function findClosingBracket(bracket){
      for(let bracketSet of bracketsConfig){
        if(bracket == bracketSet[0]){
          return bracketSet.length == 2 ? bracketSet[1] : bracketSet[0];
        }
      }
      return "";
    }
  
    function isOneTypeBracket(bracket, brConfig){
      for(let bracketSet of brConfig){
        if(bracketSet.includes(bracket)){
          return bracketSet.length == 1;
        }
      }
      return false;
    }
  
    function closingBracketPos(openingBr, closingBr, str){
      if(isOneTypeBracket(openingBr, bracketsConfig)){
        for(let i = str.length - 1; i > 0; i--){
          if(str[i] == closingBr){
            return i;
          }
        }
        return -1;
      }
      else{
        let openingBrcount = 1;
        let closingBrCount = 0;
        for(let i = 1; i < str.length; i++){
          if(str[i] == openingBr){
            openingBrcount++;
          }
          if(str[i] == closingBr){
            closingBrCount++;
          }
          if(closingBrCount == openingBrcount){
            return i;
          }
        }
        return -1;
      }
    }
  
    if(str == ""){
      return true;
    }
  
    if(containsSimilarBrackets(bracketsConfig)){
      bracketsConfig = bracketsConfig.map(x => x[0] == x[1] ? [x[0]] : x);
    }
  
    let closingBracket = findClosingBracket(str[0]);
    if(closingBracket == ""){
      return false;
    }
  
    let clBrPos = closingBracketPos(str[0], closingBracket, str);
  
    if(clBrPos == -1){
      return false;
    }
    else{
      if(clBrPos == str.length - 1){
        if(str.length == 2){
          return true;
        }
        else{
          let innerStr = str.substr(1, clBrPos - 1);
          return check(innerStr, bracketsConfig);
        }
      }
      else{
        let firstStrPart = str.substr(1, clBrPos - 1);
        let secondStrPart = str.substr(clBrPos + 1);
        return check(firstStrPart, bracketsConfig) && check(secondStrPart, bracketsConfig);
      }
    }
  }
  
  function expressionCalculator(expr) {
    function couldBeStartedIndex(expr, startValue = 0){
        if(expr.includes("(")){
            let openParPos = expr.indexOf("(");
            let subString = "";
            for(let j = 1; expr[openParPos + j] != ")"; j++){
                subString += expr[openParPos + j];
            }
            if(!subString.includes("(")){
                return startValue + openParPos;
            }
            else{
                return couldBeStartedIndex(expr.substr(openParPos + subString.indexOf("(") + 1), startValue + openParPos + subString.indexOf("(") + 1);
            }
        }
        else{
            return startValue;
        }
    }

    function getLeftNumFrom(operationIndex, expr){
        let substr = "";
        for(let i = operationIndex - 1; !Number.isNaN(+expr[i]) || expr[i] == "." || (expr[i] == "-" && Number.isNaN(expr[i - 1])); i--){
            substr += expr[i];
        }
        return +Array.from(substr).reverse().join("");
    }

    function getRightNumFrom(operationIndex, expr){
        let substr = expr[operationIndex + 1].toString();
        for(let i = operationIndex + 2; !Number.isNaN(+expr[i]) || expr[i] == "."; i++){
            substr += expr[i];
        }
        return +substr;
    }

    function insertSubstr(expr, index1, index2, substr){
    	  let res = "";
    	  for(let i = 0; i < index1; i++){
    		    res += expr[i];
    	  }
    	  res += substr;
    	  for(let i = index2; i < expr.length; i++){
    		    res += expr[i];
    	  }
    	  return res;
    }

    function expToDecimal(expNum){
        let eind = (expNum.toString()).indexOf("e");
        if(eind != -1){
            let sign = expNum >= 0 ? "" : "-";
            let deg = -(+expNum.toString().substr(eind));
            let zeros = "";
            for(let i = 0; i < deg - 1; i++){
                zeros += "0";
            }
            return +(sign + "0." + zeros + Array.from(expNum.toString().substr(0, eind)).filter(x => x != "." && x != "-").join(""));
        }
        else{
            return expNum;
        }
    }

    function reduceQuotients(expr){
        for(let i = 0; i < expr.length; i++){
            if(expr[i] == "/"){
                let left = getLeftNumFrom(i, expr);
                let right = getRightNumFrom(i, expr);
                if(!right){
                    isDivByZero = true;
                }
            	  let insertedValue = expToDecimal(+(left / right).toFixed(16).toString());
                expr = insertSubstr(expr, i - left.toString().length, i + right.toString().length + 1, insertedValue.toString());
                break;
            }
        }
        if(expr.includes("/")){
            return reduceQuotients(expr);
        }
        else{
        	return expr;
        }
    }

    function reduceProducts(expr){
        for(let i = 0; i < expr.length; i++){
            if(expr[i] == "*"){
                let left = getLeftNumFrom(i, expr);
                let right = getRightNumFrom(i, expr);
            	  let insertedValue = left * right;
                expr = insertSubstr(expr, i - left.toString().length, i + right.toString().length + 1, insertedValue.toString());
                break;
            }
        }
        if(expr.includes("*")){
            return reduceProducts(expr);
        }
        else{
        	return expr;
        }
    }

    function reduceSumAndDif(expr){
        expr = Array.from(expr).map(x => x == "-" ? "+-" : x).join("").split("+");
        return expr.reduce((res, x) => res + (+x), 0);
    }

    function evalAllBrackets(expr){
        expr = expr.replace("--", "+");
        let currentStartIndex = couldBeStartedIndex(expr);
        let substr = "";
        for(let i = currentStartIndex + 1; expr[i] != ")"; i++){
            substr += expr[i];
        }
        let primitiveSubstr = substr;
        substr = reduceQuotients(substr);
        substr = substr.replace("--", "+");
        substr = reduceProducts(substr);
        substr = substr.replace("--", "+");
        let bracketValue = reduceSumAndDif(substr);
        expr = insertSubstr(expr, currentStartIndex, currentStartIndex + primitiveSubstr.length + 2, bracketValue.toString());
        if(expr.includes("(")){
            return evalAllBrackets(expr);
        }
        else{
        	return expr;
        }
    }

    expr = Array.from(expr).filter(x => x != " ").join("");
    let bracketsString = Array.from(expr).filter(x => ["(", ")"].includes(x)).join("");
    let isDivByZero = false;

    if(check(bracketsString, [["(", ")"]])){
        if(expr.includes("(")){
            expr = evalAllBrackets(expr);
        }
        expr = reduceQuotients(expr);
        if(isDivByZero){
            throw new Error("TypeError: Division by zero.");
        }
        else{
            expr = reduceProducts(expr);
            expr = expr.replace("--", "+");
            return +reduceSumAndDif(expr).toFixed(4);
        }
    }
    else{
        throw new Error("ExpressionError: Brackets must be paired");
    }
}

module.exports = {
    expressionCalculator
}