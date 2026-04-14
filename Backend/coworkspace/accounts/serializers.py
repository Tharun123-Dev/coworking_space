from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile
import re


class RegisterSerializer(serializers.ModelSerializer):

    phone = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone']


    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value


    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value


    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters")
        return value


    def validate_phone(self, value):
        # must be digits only
        if not value.isdigit():
            raise serializers.ValidationError("Phone must contain only numbers")

        # must be 10 digits
        if len(value) != 10:
            raise serializers.ValidationError("Phone must be 10 digits")

        # must not start with 0
        if value.startswith("0"):
            raise serializers.ValidationError("Phone should not start with 0")

        return value


    def create(self, validated_data):

        phone = validated_data.pop("phone")

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # profile already created by signals -> update only
        profile = Profile.objects.get(user=user)
        profile.phone = phone
        profile.save()

        return user