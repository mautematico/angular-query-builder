function PolishNode(dad, operator) {
    this.group = {
      operator : operator,
      rules : []
    };
}

PolishNode.prototype = {
    constructor: PolishNode,
    addChild: function(child) {
        this.group.rules.push(child);
    },
    setOperator: function(operator) {
      this.group.operator = operator;
    }
};
