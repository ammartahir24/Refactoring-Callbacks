"use strict";

function TreeTransformer(n, o) {
    TreeWalker.call(this);
    this.before = n;
    this.after = o;
}

TreeTransformer.prototype = new TreeWalker();

(function(n) {
    function r(n, o) {
        return MAP(n, function(n) {
            return n.transform(o, true);
        });
    }
    n(AST_Node, noop);
    n(AST_LabeledStatement, function(n, o) {
        n.label = n.label.transform(o);
        n.body = n.body.transform(o);
    });
    n(AST_SimpleStatement, function(n, o) {
        n.body = n.body.transform(o);
    });
    n(AST_Block, function(n, o) {
        n.body = r(n.body, o);
    });
    n(AST_Do, function(n, o) {
        n.body = n.body.transform(o);
        n.condition = n.condition.transform(o);
    });
    n(AST_While, function(n, o) {
        n.condition = n.condition.transform(o);
        n.body = n.body.transform(o);
    });
    n(AST_For, function(n, o) {
        if (n.init) n.init = n.init.transform(o);
        if (n.condition) n.condition = n.condition.transform(o);
        if (n.step) n.step = n.step.transform(o);
        n.body = n.body.transform(o);
    });
    n(AST_ForIn, function(n, o) {
        n.init = n.init.transform(o);
        n.object = n.object.transform(o);
        n.body = n.body.transform(o);
    });
    n(AST_With, function(n, o) {
        n.expression = n.expression.transform(o);
        n.body = n.body.transform(o);
    });
    n(AST_Exit, function(n, o) {
        if (n.value) n.value = n.value.transform(o);
    });
    n(AST_LoopControl, function(n, o) {
        if (n.label) n.label = n.label.transform(o);
    });
    n(AST_If, function(n, o) {
        n.condition = n.condition.transform(o);
        n.body = n.body.transform(o);
        if (n.alternative) n.alternative = n.alternative.transform(o);
    });
    n(AST_Switch, function(n, o) {
        n.expression = n.expression.transform(o);
        n.body = r(n.body, o);
    });
    n(AST_Case, function(n, o) {
        n.expression = n.expression.transform(o);
        n.body = r(n.body, o);
    });
    n(AST_Try, function(n, o) {
        n.body = r(n.body, o);
        if (n.bcatch) n.bcatch = n.bcatch.transform(o);
        if (n.bfinally) n.bfinally = n.bfinally.transform(o);
    });
    n(AST_Catch, function(n, o) {
        n.argname = n.argname.transform(o);
        n.body = r(n.body, o);
    });
    n(AST_Definitions, function(n, o) {
        n.definitions = r(n.definitions, o);
    });
    n(AST_VarDef, function(n, o) {
        n.name = n.name.transform(o);
        if (n.value) n.value = n.value.transform(o);
    });
    n(AST_Lambda, function(n, o) {
        if (n.name) n.name = n.name.transform(o);
        n.argnames = r(n.argnames, o);
        n.body = r(n.body, o);
    });
    n(AST_Call, function(n, o) {
        n.expression = n.expression.transform(o);
        n.args = r(n.args, o);
    });
    n(AST_Sequence, function(n, o) {
        n.expressions = r(n.expressions, o);
    });
    n(AST_Dot, function(n, o) {
        n.expression = n.expression.transform(o);
    });
    n(AST_Sub, function(n, o) {
        n.expression = n.expression.transform(o);
        n.property = n.property.transform(o);
    });
    n(AST_Unary, function(n, o) {
        n.expression = n.expression.transform(o);
    });
    n(AST_Binary, function(n, o) {
        n.left = n.left.transform(o);
        n.right = n.right.transform(o);
    });
    n(AST_Conditional, function(n, o) {
        n.condition = n.condition.transform(o);
        n.consequent = n.consequent.transform(o);
        n.alternative = n.alternative.transform(o);
    });
    n(AST_Array, function(n, o) {
        n.elements = r(n.elements, o);
    });
    n(AST_Object, function(n, o) {
        n.properties = r(n.properties, o);
    });
    n(AST_ObjectProperty, function(n, o) {
        n.value = n.value.transform(o);
    });
})(function(n, e) {
    n.DEFMETHOD("transform", function(n, o) {
        var r, t;
        n.push(this);
        if (n.before) r = n.before(this, e, o);
        if (typeof r === "undefined") {
            r = this;
            e(r, n);
            if (n.after) {
                t = n.after(r, o);
                if (typeof t !== "undefined") r = t;
            }
        }
        n.pop();
        return r;
    });
});
