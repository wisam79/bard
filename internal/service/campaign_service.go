package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type CampaignService struct {
	repo         repository.SegmentRepository
	customerRepo repository.CustomerRepository
	log          *logger.Logger
}

func NewCampaignService(repo repository.SegmentRepository, customerRepo repository.CustomerRepository, log *logger.Logger) *CampaignService {
	return &CampaignService{repo: repo, customerRepo: customerRepo, log: log}
}

func (s *CampaignService) GetSegments() ([]domain.CustomerSegment, error) {
	segments, err := s.repo.GetSegments()
	if err != nil {
		return nil, err
	}
	for i := range segments {
		members, _ := s.repo.GetSegmentMembers(segments[i].ID)
		segments[i].CustomerCount = len(members)
	}
	return segments, nil
}

func (s *CampaignService) CreateSegment(seg *domain.CustomerSegment) error {
	if seg.Name == "" {
		return fmt.Errorf("اسم الشريحة مطلوب")
	}
	seg.ID = uuid.New().String()
	seg.CreatedAt = time.Now()
	seg.UpdatedAt = time.Now()
	s.log.Info("Customer segment created", "name", seg.Name)
	return s.repo.CreateSegment(seg)
}

func (s *CampaignService) UpdateSegment(seg *domain.CustomerSegment) error {
	seg.UpdatedAt = time.Now()
	return s.repo.UpdateSegment(seg)
}

func (s *CampaignService) DeleteSegment(id string) error {
	return s.repo.DeleteSegment(id)
}

func (s *CampaignService) AddCustomerToSegment(segmentID, customerID string) error {
	member := &domain.CustomerSegmentMember{
		SegmentID:  segmentID,
		CustomerID: customerID,
		AddedAt:    time.Now(),
	}
	return s.repo.AddMember(member)
}

func (s *CampaignService) RemoveCustomerFromSegment(segmentID, customerID string) error {
	return s.repo.RemoveMember(segmentID, customerID)
}

func (s *CampaignService) GetSegmentMembers(segmentID string) ([]domain.CustomerSegmentMember, error) {
	return s.repo.GetSegmentMembers(segmentID)
}

func (s *CampaignService) AutoSegmentCustomers() (int, error) {
	customers, _, err := s.customerRepo.GetAll(1, 10000, "")
	if err != nil {
		return 0, err
	}

	segments, err := s.repo.GetSegments()
	if err != nil {
		return 0, err
	}

	added := 0
	for _, seg := range segments {
		if !seg.IsActive {
			continue
		}
		for _, c := range customers {
			members, _ := s.repo.GetSegmentMembers(seg.ID)
			alreadyMember := false
			for _, m := range members {
				if m.CustomerID == c.ID {
					alreadyMember = true
					break
				}
			}
			if alreadyMember {
				continue
			}

			if seg.Rules == "high_value" && c.TotalPurchases > 500000 {
				s.repo.AddMember(&domain.CustomerSegmentMember{SegmentID: seg.ID, CustomerID: c.ID, AddedAt: time.Now()})
				added++
			} else if seg.Rules == "in_debt" && c.Debt > 0 {
				s.repo.AddMember(&domain.CustomerSegmentMember{SegmentID: seg.ID, CustomerID: c.ID, AddedAt: time.Now()})
				added++
			} else if seg.Rules == "new_customer" && c.TotalPurchases == 0 {
				s.repo.AddMember(&domain.CustomerSegmentMember{SegmentID: seg.ID, CustomerID: c.ID, AddedAt: time.Now()})
				added++
			}
		}
	}
	return added, nil
}

func (s *CampaignService) GetCampaigns() ([]domain.Campaign, error) {
	return s.repo.GetCampaigns()
}

func (s *CampaignService) CreateCampaign(c *domain.Campaign) error {
	if c.Name == "" {
		return fmt.Errorf("اسم الحملة مطلوب")
	}
	c.ID = uuid.New().String()
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()
	if c.Status == "" {
		c.Status = "draft"
	}
	s.log.Info("Campaign created", "name", c.Name)
	return s.repo.CreateCampaign(c)
}

func (s *CampaignService) UpdateCampaign(c *domain.Campaign) error {
	c.UpdatedAt = time.Now()
	return s.repo.UpdateCampaign(c)
}

func (s *CampaignService) DeleteCampaign(id string) error {
	return s.repo.DeleteCampaign(id)
}

func (s *CampaignService) StartCampaign(id string) error {
	c, err := s.repo.GetCampaignByID(id)
	if err != nil {
		return err
	}
	c.Status = "active"
	now := time.Now()
	c.StartedAt = &now
	return s.repo.UpdateCampaign(c)
}
