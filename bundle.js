"use strict"

const merge = require("merge-recursive").recursive
const ZeroNet = require("zeronet-node")
const MEM = require("zeronet-storage-memory")
const clone = require("clone")

const Id = require("peer-id")

module.exports = function ZeroNetBundler(opt) {

  const bname = opt.name || "ZeroNetBundle"
  let r = {}
  const strict = {
    modules: opt.modules
  }

  const defaults = merge(opt.override, {
    swarm: {
      zero: {
        listen: [],
        crypto: [
          require("zeronet-crypto/secio")
        ]
      },
      libp2p: {}
    },
    modules: {},
    storage: MEM
  })
  r[bname] = function (opt, cb) { //hack to set function name
    if (!cb) cb = () => {}
    if (!opt) opt = {}
    let config = merge(merge(clone(defaults), clone(strict)), merge(opt, clone(strict)))
    if (!opt.storage) config.storage = new defaults.storage()
    let node
    const liftoff = (err, id) => {
      if (err) return cb(err)
      if (id) config.id = id
      node = new ZeroNet(config)
      cb(null, node)
      return node
    }

    if (!opt.id) {
      Id.create({
        bits: 2048
      }, liftoff)
    } else return liftoff(null, opt.id)
  }
  return r[bname]

}
