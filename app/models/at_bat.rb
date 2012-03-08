class AtBat < ActiveRecord::Base
    belongs_to :game
    acts_as_list :scope => :game

    after_destroy :publish_delete
    after_save :publish_save

    attr_protected :position

    def stringified_pitches
        self.pitches.join(",")
    end

    def stringified_pitches=(val)
        self.pitches = val.split(",")
    end

    def pitches
        pitches_from_db = read_attribute('pitches')
        pitches_from_db ? Marshal.load(read_attribute('pitches')) : []
    end

    def pitches=(pitches_collection)
        write_attribute('pitches', Marshal.dump(pitches_collection))
    end

    private

    def publish_delete
        publish_to_redis(:delete)
    end

    def publish_save
        publish_to_redis(:save)
    end
        
    def publish_to_redis(method)
        REDIS.publish("games:#{game_id}", { method => self }.to_json)
        logger.info("###### #{method} AtBat with id #{self.id} to Redis")
    end
end

