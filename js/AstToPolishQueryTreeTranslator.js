

function AstToPolishQueryTreeTranslator(){
  this.jsep = jsep.noConflict();
  this.mathematical = ['>', '>=', '<', '<=', '=', '<>',];
  this.logical = ['AND', 'OR'];

  //Removing unused binary_ops: https://github.com/soney/jsep/blob/master/src/jsep.js#L55
  this.jsep.removeBinaryOp('||');
  this.jsep.removeBinaryOp('&&');
  this.jsep.removeBinaryOp('|');
  this.jsep.removeBinaryOp('^');
  this.jsep.removeBinaryOp('&');
  this.jsep.removeBinaryOp('==');
  this.jsep.removeBinaryOp('!=');
  this.jsep.removeBinaryOp('===');
  this.jsep.removeBinaryOp('!==');
  this.jsep.removeBinaryOp('<<');
  this.jsep.removeBinaryOp('>>');
  this.jsep.removeBinaryOp('>>>');
  this.jsep.removeBinaryOp('+');
  this.jsep.removeBinaryOp('-');
  this.jsep.removeBinaryOp('*');
  this.jsep.removeBinaryOp('/');
  this.jsep.removeBinaryOp('%');

  //Adding custom binary_ops
  this.jsep.addBinaryOp("OR", 1);
  this.jsep.addBinaryOp("AND", 2);
  this.jsep.addBinaryOp("=", 6);
  this.jsep.addBinaryOp("<>", 6);

  //Removing unused unary_ops: https://github.com/soney/jsep/blob/master/src/jsep.js#L51
  this.jsep.removeUnaryOp('-');
  this.jsep.removeUnaryOp('!');
  this.jsep.removeUnaryOp('~');
  this.jsep.removeUnaryOp('+');
}

AstToPolishQueryTreeTranslator.prototype = {
  constructor: AstToPolishQueryTreeTranslator,
  /**
    Please keep in mind that astToPolishQueryTree asumes it will receive 'valid' ast. At this point, 'valid' means that its original expression (ex `(Firstname = Mauricio)` can be built using <query-builder>
  **/
  astToPolishQueryTree: function astToPolishQueryTree(p, n, polish) {
      var pOp = (p === null) ? null : p.operator;
      var nOp = n.operator;

      //Special case: This shall only happen when we received a 'single' expresion, like `(Firstname = Mauricio)`
      //In this case, the (mathematical) operator (aka condition) is ast's root (n param).
      //Sure we can optimize this code and merge @note:single rule check into one single piece of code. DRY.
      if(this.mathematical.includes(nOp)){
        polish.setOperator('AND');
        polish.addChild(
            this.astNodeToPolishQueryTreeRule(n)
        );
      return polish;
      }

      //if null equals p, n is ast's root.
      if(p === null){
        polish.setOperator(nOp);
      }
      var polishNode = (p === null || nOp === pOp) ? polish : (new PolishNode(polish, n.operator));
      if (p !== null && nOp !== pOp){
        polish.addChild(polishNode);
      }

      //@note:single rule check
      //if n.left's 'root' is a mathematical operator, n.left shall be a 'single rule' like `(Firstname = Mauricio)`
      if (this.mathematical.includes(n.left.operator)) {
          polishNode.addChild(
              this.astNodeToPolishQueryTreeRule(n.left)
          );
      } else {
          //if n.left's root is not a mathematical operator, it shall be a logical one. Then let's go recursive.
          this.astToPolishQueryTree(n, n.left, polishNode);
      }
      if (this.mathematical.includes(n.right.operator)) {
          polishNode.addChild(
              this.astNodeToPolishQueryTreeRule(n.right)
          );
      } else {
          this.astToPolishQueryTree(n, n.right, polishNode);
      }

      return polish;
  },
  astNodeToPolishQueryTreeRule: function (astNode) {
      return {
          field: astNode.left.name,
          condition: astNode.operator,
          data: (!astNode.right.name) ? astNode.right.value : (astNode.right.name)
      };
  }
};
