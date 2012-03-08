class AtBatsController < ApplicationController
    before_filter :get_game
    before_filter :get_at_bat, :except => :index
    before_filter :admin_mode, :only => [:create, :update, :destroy]

    # GET /at_bats
    # GET /at_bats.xml
    def index
        @at_bats = AtBat.all
    end

    # POST /at_bats
    # POST /at_bats.xml
    def create
        @at_bat.attributes = params[:at_bat]

        respond_to do |format|
            format.js do 
                render :update do |page|
                    # use transaction to rollback any changes in the event of an exception with redis
                    AtBat.transaction do
                        # assumes everything is going to be saved correctly because there are no validations
                        @at_bat.save
                        page.insert_html :top, "at_bats", :partial => 'at_bats/at_bat', :locals => { :at_bat => @at_bat }
                    end
                end
            end
        end
    end

    # PUT /at_bats/1
    # PUT /at_bats/1.xml
    def update
        respond_to do |format|
            format.js do 
                render :update do |page|
                    # use transaction to rollback any changes in the event of an exception with redis
                    AtBat.transaction do
                        @at_bat.update_attributes(params[:at_bat])
                        at_bat_div = "at_bat_#{@at_bat.id}"
                        page.replace at_bat_div, :partial => 'at_bats/at_bat', :locals => { :at_bat => @at_bat }
                        page.visual_effect :highlight, at_bat_div 
                    end
                end
            end
        end
    end

    # DELETE /at_bats/1
    # DELETE /at_bats/1.xml
    def destroy
        @at_bat.destroy

        redirect_to(@game)
    end

    private

    def get_game
        @game = Game.find(params[:game_id])
    end

    def get_at_bat
        @at_bat = if params[:id]
            @game.at_bats.find(params[:id])
        else
            @game.at_bats.build
        end
    end
end
