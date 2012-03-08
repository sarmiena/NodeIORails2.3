exports.Hash = function() {
    this.length = 0;
    this.hash = {};

    var self = this;

    this.add = function(key, val) {
        self.hash[key] = val;
        self.length++;
        return val;
    }

    this.remove = function(key) {
        if (self.hash[key] !== undefined) {
            self.length--;
            delete self.hash[key];
        }
    }

    this.get = function(key) {
        return self.hash[key];
    }

    this.each_pair = function(method) {
        for (var key in self.hash)
            method(key, self.hash[key]);
    }
}
