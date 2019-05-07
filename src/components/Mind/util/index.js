import upperFirst from 'lodash/upperFirst';

const canvas = document.createElement('canvas');
const canvasContext = canvas.getContext('2d');

const Util = {
  optimizeMultilineText(text, font, maxWidth = 320) {
    canvasContext.font = font;

    if (canvasContext.measureText(text) <= maxWidth) {
      return text;
    }

    let multilineText = '';
    let multilineTextWidth = 0;

    for (const char of text) {
      const { width } = canvasContext.measureText(char);

      if (multilineTextWidth + width >= maxWidth) {
        multilineText += '\n';
        multilineTextWidth = 0;
      }

      multilineText += char;
      multilineTextWidth += width;
    }

    return multilineText;
  },

  getRectPath(x, y, w, h, r) {
    if (r) {
      return [
        ['M', +x + (+r), y],
        ['l', w - r * 2, 0],
        ['a', r, r, 0, 0, 1, r, r],
        ['l', 0, h - r * 2],
        ['a', r, r, 0, 0, 1, -r, r],
        ['l', r * 2 - w, 0],
        ['a', r, r, 0, 0, 1, -r, -r],
        ['l', 0, r * 2 - h],
        ['a', r, r, 0, 0, 1, r, -r],
        ['z'],
      ];
    }

    const res = [
      ['M', x, y],
      ['l', w, 0],
      ['l', 0, h],
      ['l', -w, 0],
      ['z'],
    ];

    res.toString = toString;

    return res;
  },

  getCollapseButtonPath({ width, height }) {
    const rect = this.getRectPath(0, 0, width, height, 2);
    const hp = `M${width * 3 / 14},${height / 2} L${width * 11 / 14},${height / 2}`;
    const vp = '';
    return rect + hp + vp;
  },

  getExpandButtonPath({ width, height }) {
    const rect = this.getRectPath(0, 0, width, height, 2);
    const hp = `M${width * 3 / 14},${height / 2} L${width * 11 / 14},${height / 2}`;
    const vp = `M${width / 2},${height * 3 / 14} L${width / 2},${height * 11 / 14}`;

    return rect + hp + vp;
  },

  // called by mindNode.js
  itemStates({ item, group }) {
    const getCustomInitialStyle = (child) => {
      if (typeof this[[`get${upperFirst(child.get('className'))}Style`]] === 'function') {
        const customStyle = this[`get${upperFirst(child.get('className'))}Style`]({ model: item.getModel() });
        return {
          ...child.getDefaultAttrs(),
          ...customStyle,
        };
      }
      return {
        ...child.getDefaultAttrs(),
      };
    };

    const dynamicBase = (type) => {
      const newStyleObj = this.getCustomStatesStyle()[type];
      Object.keys(newStyleObj).forEach((className) => {
        const currentChild = group.findByClassName(className);
        if (currentChild) {
          currentChild.attr({
            ...getCustomInitialStyle(currentChild),
            ...newStyleObj[className],
          });
        }
      });
      this.adjustKeyShape({
        updatedKeyShape: group.findByClassName('keyShape'),
        updatedLabelShape: group.findByClassName('label'),
      });
      this.adjustLabelShape({
        updatedKeyShape: group.findByClassName('keyShape'),
        updatedLabelShape: group.findByClassName('label'),
      });
    };

    // active style
    const active = () => {
      dynamicBase('active');
    };

    // initial style
    const staticState = () => {
      // get children of group
      const groupChildren = group.get('children');

      groupChildren.map((child) => {
        return child.attr({
          ...getCustomInitialStyle(child),
        });
      });
      this.adjustKeyShape({
        updatedKeyShape: group.findByClassName('keyShape'),
        updatedLabelShape: group.findByClassName('label'),
      });
      this.adjustLabelShape({
        updatedKeyShape: group.findByClassName('keyShape'),
        updatedLabelShape: group.findByClassName('label'),
      });
    };

    // selected style
    const selected = () => {
      dynamicBase('selected');
    };

    return {
      active,
      selected,
      staticState,
    };
  },
};

export default Util;
