import '../../../common/index-e369b43e.js';
import { s as select } from '../../../common/select-d9849a38.js';

function attrsFunction(transition, map) {
  return transition.each(function() {
    var x = map.apply(this, arguments), t = select(this).transition(transition);
    for (var name in x) t.attr(name, x[name]);
  });
}

function attrsObject(transition, map) {
  for (var name in map) transition.attr(name, map[name]);
  return transition;
}

function transition_attrs(map) {
  return (typeof map === "function" ? attrsFunction : attrsObject)(this, map);
}

export default transition_attrs;
