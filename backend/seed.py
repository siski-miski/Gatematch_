"""Create coherent, repeatable demo data for local development."""
import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.card import Card
from app.models.deal import Deal
from app.models.notification import Notification
from app.models.user import User
from app.models.verification import Verification


DEMO_PASSWORD = "password123"

USERS = [
    {"email": "jm@novex.com", "full_name": "Jean-Marc Dupont", "company_name": "Novex Payments Ltd", "role": "provider", "country": "France", "plan": "professional", "trust_score": 94},
    {"email": "sarah@brightroute.com", "full_name": "Sarah Chen", "company_name": "BrightRoute Inc.", "role": "seeker", "country": "Brazil", "plan": "explorer", "trust_score": 88},
    {"email": "ali@atlas.ae", "full_name": "Ali Rashid", "company_name": "Atlas Financial FZ", "role": "provider", "country": "United Arab Emirates", "plan": "enterprise", "trust_score": 97},
    {"email": "maria@kreatorworks.ph", "full_name": "Maria Santos", "company_name": "Kreatorworks PH", "role": "seeker", "country": "Philippines", "plan": "professional", "trust_score": 79},
    {"email": "thomas@qantpay.com", "full_name": "Thomas Müller", "company_name": "QantPay Solutions", "role": "provider", "country": "Germany", "plan": "professional", "trust_score": 91},
    {"email": "emma@safex.de", "full_name": "Emma Weber", "company_name": "Safex Europe GmbH", "role": "provider", "country": "Austria", "plan": "explorer", "trust_score": 86},
    {"email": "david@clearpay.sg", "full_name": "David Lim", "company_name": "ClearPay Global", "role": "both", "country": "Singapore", "plan": "professional", "trust_score": 89},
]

CARDS = [
    {"key": "novex-paypal-public", "email": "jm@novex.com", "type": "offer", "title": "PayPal Business Gateway — EU & UK", "description": "Established EU payment capacity for eCommerce and SaaS merchants, with transparent pricing and fast settlement.", "gateway_type": "PayPal", "regions": ["EU", "North America"], "industries": ["eCommerce", "SaaS"], "currencies": ["EUR", "GBP", "USD"], "pricing_model": "percentage", "commission_rate": 2.8, "min_volume": 5000, "max_volume": 80000, "views_count": 124, "proposal_status": "accepted", "is_active": True},
    {"key": "brightroute-stripe-public", "email": "sarah@brightroute.com", "type": "request", "title": "Seeking US Stripe Access — High Volume", "description": "LATAM SaaS company seeking a verified US processing partner. Clean chargeback history and prepared financial information.", "gateway_type": "Stripe", "regions": ["North America", "LATAM"], "industries": ["SaaS"], "currencies": ["USD"], "pricing_model": "negotiable", "min_volume": 150000, "max_volume": 300000, "views_count": 87, "proposal_status": "accepted", "is_active": True},
    {"key": "atlas-adyen-public", "email": "ali@atlas.ae", "type": "offer", "title": "Adyen Processing Capacity — MENA & Africa", "description": "Verified PSP capacity for cross-border Africa and GCC merchants, with multi-currency settlement and clear onboarding steps.", "gateway_type": "Adyen", "regions": ["MENA", "Africa"], "industries": ["eCommerce", "Travel"], "currencies": ["USD", "EUR", "AED"], "pricing_model": "percentage", "commission_rate": 1.9, "fixed_fee": 0.2, "min_volume": 10000, "max_volume": 500000, "views_count": 215, "proposal_status": "accepted", "is_active": True},
    {"key": "kreator-payout-public", "email": "maria@kreatorworks.ph", "type": "request", "title": "Looking for Payout Rails — Southeast Asia", "description": "Creator economy platform seeking reliable local-currency payouts across the Philippines, Indonesia, and Vietnam.", "gateway_type": "Wire Transfer", "regions": ["Asia"], "industries": ["Creator Economy"], "currencies": ["PHP", "USD"], "pricing_model": "percentage", "commission_rate": 1.5, "min_volume": 20000, "max_volume": 100000, "views_count": 61, "proposal_status": "accepted", "is_active": True},
    {"key": "qantpay-acquiring-public", "email": "thomas@qantpay.com", "type": "offer", "title": "High-Volume Acquiring — Travel & Ticketing", "description": "Specialist acquiring capacity for travel agencies, OTAs, and ticket resellers with structured reserves and refund handling.", "gateway_type": "Worldpay", "regions": ["EU", "North America"], "industries": ["Travel", "High Risk"], "currencies": ["EUR", "USD", "GBP"], "pricing_model": "percentage", "commission_rate": 3.5, "min_volume": 50000, "max_volume": 500000, "views_count": 342, "proposal_status": "accepted", "is_active": True},
    {"key": "safex-redundancy-public", "email": "emma@safex.de", "type": "offer", "title": "Gateway Redundancy Partner — EU eCommerce", "description": "Backup processing capacity for EU eCommerce businesses, with a fixed-fee option and a clear 72-hour onboarding target.", "gateway_type": "Checkout.com", "regions": ["EU"], "industries": ["eCommerce"], "currencies": ["EUR"], "pricing_model": "fixed", "fixed_fee": 0.35, "min_volume": 0, "max_volume": 200000, "views_count": 98, "proposal_status": "accepted", "is_active": True},
    {"key": "novex-sell-proposal", "email": "jm@novex.com", "type": "offer", "operation_type": "sell", "title": "Private Sell Proposal — EU PayPal Capacity", "description": "Private capacity partnership proposal for a verified EU PayPal business gateway.", "gateway_type": "PayPal", "regions": ["EU"], "industries": ["eCommerce"], "currencies": ["EUR", "GBP"], "pricing_model": "percentage", "commission_rate": 2.8, "min_volume": 5000, "max_volume": 80000, "proposal_status": "accepted", "is_active": False},
    {"key": "brightroute-rent-proposal", "email": "sarah@brightroute.com", "type": "request", "operation_type": "rent", "title": "Private Rent Proposal — US Processing Capacity", "description": "Private capacity partnership request for US processing access at the stated monthly volume.", "gateway_type": "Stripe", "regions": ["North America"], "industries": ["SaaS"], "currencies": ["USD"], "pricing_model": "negotiable", "min_volume": 150000, "max_volume": 300000, "proposal_status": "pending", "is_active": False},
    {"key": "atlas-sell-proposal", "email": "ali@atlas.ae", "type": "offer", "operation_type": "sell", "title": "Private Sell Proposal — MENA Acquiring Capacity", "description": "Private capacity partnership proposal for MENA and Africa acquiring corridors.", "gateway_type": "Adyen", "regions": ["MENA", "Africa"], "industries": ["Travel", "eCommerce"], "currencies": ["USD", "AED"], "pricing_model": "percentage", "commission_rate": 1.9, "min_volume": 10000, "max_volume": 500000, "proposal_status": "declined", "is_active": False},
]

DEALS = [
    {"card_key": "novex-paypal-public", "provider": "jm@novex.com", "seeker": "sarah@brightroute.com", "initiator": "sarah@brightroute.com", "status": "active", "monthly_volume": 12000, "commission_rate": 2.8, "days_ago": 45},
    {"card_key": "atlas-adyen-public", "provider": "ali@atlas.ae", "seeker": "maria@kreatorworks.ph", "initiator": "maria@kreatorworks.ph", "status": "active", "monthly_volume": 48000, "commission_rate": 1.9, "days_ago": 30},
    {"card_key": "safex-redundancy-public", "provider": "emma@safex.de", "seeker": "sarah@brightroute.com", "initiator": "sarah@brightroute.com", "status": "pending", "monthly_volume": 8000, "commission_rate": 0.35},
    {"card_key": "qantpay-acquiring-public", "provider": "thomas@qantpay.com", "seeker": "sarah@brightroute.com", "initiator": "sarah@brightroute.com", "status": "review", "monthly_volume": 30000, "commission_rate": 3.5, "days_ago": 60},
    {"card_key": "brightroute-stripe-public", "provider": "ali@atlas.ae", "seeker": "sarah@brightroute.com", "initiator": "ali@atlas.ae", "status": "completed", "monthly_volume": 180000, "commission_rate": 2.4, "days_ago": 120},
]

LEGACY_ADMIN_CARD_TITLES = {
    "PayPal Business Gateway â€” EU & UK",
    "Seeking US Stripe/Braintree Access â€” High Volume",
    "Adyen Sub-Acquiring â€” MENA & Africa",
    "Crypto On-Ramp / Off-Ramp â€” Global Coverage",
    "Need SEPA Direct Debit â€” Subscription SaaS",
    "High-Risk Merchant Acquiring â€” EU Licensed",
    "ACH & Wire Transfers â€” US Domestic",
    "Looking for LATAM Payment Processing",
}


def upsert_user(db, data):
    user = db.query(User).filter(User.email == data["email"]).first()
    if not user:
        user = User(email=data["email"], password_hash=hash_password(DEMO_PASSWORD))
        db.add(user)
    for field, value in data.items():
        if field != "email":
            setattr(user, field, value)
    user.is_verified = True
    db.flush()
    return user


def upsert_verifications(db, user):
    for verification_type in ("kyc", "kyb", "aml", "bank"):
        verification = db.query(Verification).filter(Verification.user_id == user.id, Verification.type == verification_type).first()
        if not verification:
            verification = Verification(user_id=user.id, type=verification_type)
            db.add(verification)
        verification.status = "approved"
        verification.rejection_reason = None


def upsert_card(db, data, users):
    user = users[data["email"]]
    card = db.query(Card).filter(Card.user_id == user.id, Card.title == data["title"]).first()
    if not card:
        card = Card(user_id=user.id, title=data["title"])
        db.add(card)
    values = {key: value for key, value in data.items() if key not in {"key", "email", "title"}}
    values["user_id"] = user.id
    for field, value in values.items():
        setattr(card, field, value)
    db.flush()
    return card


def upsert_deal(db, data, cards, users):
    card = cards[data["card_key"]]
    provider = users[data["provider"]]
    seeker = users[data["seeker"]]
    initiator = users[data["initiator"]]
    deal = db.query(Deal).filter(Deal.card_id == card.id, Deal.provider_id == provider.id, Deal.seeker_id == seeker.id).first()
    if not deal:
        deal = Deal(card_id=card.id, provider_id=provider.id, seeker_id=seeker.id)
        db.add(deal)
    deal.status = data["status"]
    deal.monthly_volume = data["monthly_volume"]
    deal.commission_rate = data["commission_rate"]
    deal.initiator_id = initiator.id
    if data["status"] in {"pending", "countered"}:
        deal.last_action_by = initiator.id
    if not deal.terms_history:
        deal.terms_history = [{
            "action": "request",
            "user_id": initiator.id,
            "monthly_volume": data["monthly_volume"],
            "commission_rate": data["commission_rate"],
            "created_at": date.today().isoformat(),
        }]
    if data.get("days_ago") is not None:
        deal.start_date = date.today() - timedelta(days=data["days_ago"])
    if data["status"] == "completed":
        deal.end_date = date.today() - timedelta(days=15)
        card.is_active = False
        card.proposal_status = "completed"
    else:
        deal.end_date = None
    db.flush()


def add_notification(db, user, message, notification_type):
    existing = db.query(Notification).filter(Notification.user_id == user.id, Notification.message == message).first()
    if not existing:
        db.add(Notification(user_id=user.id, type=notification_type, message=message))


def remove_legacy_demo_cards(db, users):
    desired_titles = {data["title"] for data in CARDS}
    demo_user_ids = [user.id for user in users.values()]
    legacy_cards = db.query(Card).filter(Card.user_id.in_(demo_user_ids)).all()
    for card in legacy_cards:
        if card.title not in desired_titles:
            db.query(Deal).filter(Deal.card_id == card.id).delete(synchronize_session=False)
            db.delete(card)

    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        old_admin_cards = [
            card for card in db.query(Card).filter(Card.user_id == admin.id).all()
            if card.title.startswith((
                "PayPal Business Gateway",
                "Seeking US Stripe/Braintree Access",
                "Adyen Sub-Acquiring",
                "Crypto On-Ramp / Off-Ramp",
                "Need SEPA Direct Debit",
                "High-Risk Merchant Acquiring",
                "ACH & Wire Transfers",
                "Looking for LATAM Payment Processing",
            ))
        ]
        for card in old_admin_cards:
            db.query(Deal).filter(Deal.card_id == card.id).delete(synchronize_session=False)
            db.delete(card)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = {data["email"]: upsert_user(db, data) for data in USERS}
        for user in users.values():
            upsert_verifications(db, user)
        remove_legacy_demo_cards(db, users)
        cards = {data["key"]: upsert_card(db, data, users) for data in CARDS}
        db.commit()

        for data in DEALS:
            upsert_deal(db, data, cards, users)
        add_notification(db, users["jm@novex.com"], "Your PayPal public offer is live in the Marketplace.", "card")
        add_notification(db, users["sarah@brightroute.com"], "Your private rent proposal is waiting for admin review.", "proposal")
        add_notification(db, users["ali@atlas.ae"], "Your Adyen public offer is live in the Marketplace.", "card")
        db.commit()
        print(f"Seeded {len(users)} verified demo users, {len(cards)} cards, and {len(DEALS)} deals.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
