require 'test_helper'

class AtBatsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:at_bats)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create at_bat" do
    assert_difference('AtBat.count') do
      post :create, :at_bat => { }
    end

    assert_redirected_to at_bat_path(assigns(:at_bat))
  end

  test "should show at_bat" do
    get :show, :id => at_bats(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => at_bats(:one).to_param
    assert_response :success
  end

  test "should update at_bat" do
    put :update, :id => at_bats(:one).to_param, :at_bat => { }
    assert_redirected_to at_bat_path(assigns(:at_bat))
  end

  test "should destroy at_bat" do
    assert_difference('AtBat.count', -1) do
      delete :destroy, :id => at_bats(:one).to_param
    end

    assert_redirected_to at_bats_path
  end
end
