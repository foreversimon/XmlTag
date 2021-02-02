export const CreatXmlDoc = class {
  constructor(obj) {
    this.tagName = obj.tagName;
    this.attribute = obj.attribute;
    this.children = obj.children && obj.children.map(function (item) {
      if (typeof item === "object") {
        item = new CreatXmlDoc(item);
      }
      return item;
    });
  }
  render() {
    const el = document.createElement(this.tagName);
    const children = this.children || [];
    const attribute = this.attribute || {};
    Object.keys(attribute).forEach(key => {
      el.setAttribute(key, attribute[key])
    });
    children.forEach(function (child) {
      const childEl = (child instanceof CreatXmlDoc)
        ? child.render()
        : document.createTextNode(child);
      el.appendChild(childEl)
    })
    return el
  }
}

const parent = Symbol('parent')
export const Tag = class {
  /**
   * 创建一个Xml节点
   * @param {{name: string, id?: string, attribute?: object, children?: Tag[]}} options
   */
  constructor({ name, id, attribute, children }) {
    this.tagName = name
    this.id = id
    this.attribute = attribute || {}
    this.children = children || []
    this.children.forEach(item => {
      if (typeof item === 'object') {
        item[parent] = this
      }
    })
  }
  /**
   * 设置当前节点属性
   * @param {string} key
   * @param {string} value
   * @returns {Tag}
   */
  setAttribute(key, value) {
    this.attribute[key] = value;
    return this
  }
  /**
   * 向当前节点最后添加子节点
   * @param {Tag} value
   * @returns {Tag}
   */
  appendChild(value) {
    if (Array.isArray(this.children)) {
      if (typeof value === 'object') {
        value[parent] = this
      }
      this.children.push(value)
    }
    return this
  }
  /**
   * 移除子节点
   * @param {Tag} value
   * @returns {Tag}
   */
  removeChild(value) {
    this.children = this.children.filter(item => item !== value)
    return this
  }
  /**
   * 移除当前节点
   */
  remove() {
    this[parent].removeChild(this)
  }
  /**
   * 获取id对应节点
   * @param {string} id
   * @param children
   */
  getElementById (id, children = this.children) {
    let target = null
    for (let item of children) {
      if (item.id === id) {
        target = item
        break
      }
      target = this.getElementById(id, item.children || [])
      if (target) break
    }
    return target
  }
  /**
   * 把Xml转成字符串
   * @returns {string}
   */
  toString() {
    const xmlDoc = new CreatXmlDoc(this)
    const xmlRender = xmlDoc.render()
    return new XMLSerializer().serializeToString(xmlRender)
  }
}

export const types = {
  event: {
    /**
     * 开始事件
     * @param {{attribute: {id: string}, id?: string, children?: Tag[]}} args
     */
    startEvent: (args) => new Tag({name: 'startEvent',...args}),
    /**
     * 结束事件
     * @param {{attribute: {id: string}, id?: string, children?: Tag[]}} args
     */
    endEvent: (args) => new Tag({name: 'endEvent',...args}),
    /**
     * 错误事件
     * @param {{attribute: {}, id?: string, children?: Tag[]}} args
     */
    errorEventDefinition: (args) => new Tag({name: 'errorEventDefinition',...args})
  },
  gateway: {
    /**
     * 排他网关
     * @param {{attribute: {id: string, name?: string, default: string}, id?: string, children?: Tag[]}} args
     */
    exclusiveGateway: (args) => new Tag({name: 'exclusiveGateway', ...args}),
    /**
     * 并行网关
     * @param {{attribute: {id: string, name?: string}, id?: string, children?: Tag[]}} args
     */
    parallelGateway: (args) => new Tag({name: 'parallelGateway', ...args}),
    /**
     * 包含网关
     * @param {{attribute: {id: string, name?: string}, id?: string, children?: Tag[]}} args
     */
    inclusiveGateway: (args) => new Tag({name: 'inclusiveGateway', ...args}),
  },
  task: {
    /**
     * 用户任务
     * @param {{attribute: {id: string, name?: string}, id?: string, children?: Tag[]}} args
     */
    userTask: (args) => new Tag({name: 'userTask', ...args}),
    /**
     * JAVA任务
     * @param {{attribute: {id: string, name?: string}, id?: string, children?: Tag[]}} args
     */
    serviceTask: (args) => new Tag({name: 'serviceTask', ...args})
  },
  flow: {
    /**
     * 顺序流
     * @param {{attribute: {id: string, sourceRef: string, target: string, name?: string}, id?: string, children?: Tag[]}} args
     */
    sequenceFlow: (args) => new Tag({name: 'sequenceFlow', ...args})
  }
}

export default Tag
