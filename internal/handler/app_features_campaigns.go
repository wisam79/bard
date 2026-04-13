package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetCampaigns() ([]domain.Campaign, error) {
	return a.campaign.GetCampaigns()
}

func (a *App) CreateCampaign(token string, campaign domain.Campaign) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.CreateCampaign(&campaign)
}

func (a *App) UpdateCampaign(token string, campaign domain.Campaign) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.UpdateCampaign(&campaign)
}

func (a *App) DeleteCampaign(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.DeleteCampaign(id)
}

func (a *App) StartCampaign(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.StartCampaign(id)
}
