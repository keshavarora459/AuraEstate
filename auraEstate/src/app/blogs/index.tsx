import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchAdminBlogs } from '@/services/api';
import { COLORS } from '@/constants/colors';

const CATEGORIES = [
  'All',
  'Market Insights',
  'Sellers Guide',
  'Investment Analysis',
  'Architecture & Design',
  'Legal & Tax',
  'Luxury Suburbs',
];

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  readTime: string;
  createdAt: string;
  featured?: boolean;
}

export default function BlogsScreen() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Article[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBlog, setActiveBlog] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetchAdminBlogs();
        if (res.data?.success && res.data.blogs?.length > 0) {
          const dbBlogs = res.data.blogs.map((b: any) => ({
            ...b,
            category: b.category || 'Market Insights',
            readTime: b.readTime || '5 min read',
            author: b.author || 'Aura Editorial',
            image: b.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
          }));

          setBlogs(dbBlogs);
          setFilteredBlogs(dbBlogs);
        }
      } catch (err) {
        console.warn('Failed to fetch admin blogs from server:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  useEffect(() => {
    let result = blogs;
    if (selectedCategory !== 'All') {
      result = result.filter(
        b => (b.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        b =>
          (b.title || '').toLowerCase().includes(q) ||
          (b.excerpt || '').toLowerCase().includes(q) ||
          (b.category || '').toLowerCase().includes(q)
      );
    }
    setFilteredBlogs(result);
  }, [blogs, selectedCategory, searchQuery]);

  const handleShare = async (article: Article) => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.excerpt}\n\nRead more on AuraEstate Luxury Intelligence.`,
      });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Market Insights</Text>
          <Text style={styles.headerSubtitle}>Real estate intelligence & economic analysis</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles, suburbs, investment guides..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoryScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContent}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Articles Feed */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : filteredBlogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Articles Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search query or category filter.</Text>
          </View>
        ) : (
          filteredBlogs.map((article, idx) => (
            <TouchableOpacity
              key={article._id || idx}
              style={styles.articleCard}
              activeOpacity={0.88}
              onPress={() => setActiveBlog(article)}
            >
              <Image source={{ uri: article.image }} style={styles.articleImage} />
              <View style={styles.articleContent}>
                <View style={styles.metaRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{article.category}</Text>
                  </View>
                  <View style={styles.readTimeRow}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                    <Text style={styles.readTimeText}>{article.readTime}</Text>
                  </View>
                </View>

                <Text style={styles.articleTitle} numberOfLines={2}>
                  {article.title}
                </Text>

                <Text style={styles.articleExcerpt} numberOfLines={2}>
                  {article.excerpt}
                </Text>

                <View style={styles.authorRow}>
                  <View style={styles.authorAvatar}>
                    <Ionicons name="person" size={12} color={COLORS.primary} />
                  </View>
                  <Text style={styles.authorName} numberOfLines={1}>{article.author}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.readMoreText}>Read Article</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Article Detail Modal */}
      <Modal visible={!!activeBlog} animationType="slide" transparent onRequestClose={() => setActiveBlog(null)}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveBlog(null)}>
                <Ionicons name="close" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {activeBlog?.category}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => activeBlog && handleShare(activeBlog)}
              >
                <Ionicons name="share-outline" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {activeBlog && (
              <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Image source={{ uri: activeBlog.image }} style={styles.modalCoverImage} />

                <View style={styles.modalBodyContent}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{activeBlog.category}</Text>
                  </View>

                  <Text style={styles.modalArticleTitle}>{activeBlog.title}</Text>

                  <View style={styles.modalAuthorRow}>
                    <View style={styles.modalAuthorAvatar}>
                      <Ionicons name="person" size={14} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.modalAuthorName}>{activeBlog.author}</Text>
                      <Text style={styles.modalAuthorDate}>
                        {new Date(activeBlog.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })} • {activeBlog.readTime}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalExcerptBox}>
                    <Text style={styles.modalExcerptText}>{activeBlog.excerpt}</Text>
                  </View>

                  <Text style={styles.modalBodyText}>{activeBlog.content}</Text>

                  <View style={styles.disclaimerBox}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.disclaimerText}>
                      Information provided is for market intelligence and informational purposes only. Consult with licensed property and financial advisors before executing high-value acquisitions.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  categoryScrollWrap: {
    marginBottom: 8,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  articleCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  articleImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.borderDark,
  },
  articleContent: {
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  categoryBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  readTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  articleExcerpt: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 10,
  },
  authorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  authorName: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  readMoreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    backgroundColor: '#ffffff',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  modalBody: {
    paddingBottom: 40,
  },
  modalCoverImage: {
    width: '100%',
    height: 240,
    backgroundColor: COLORS.borderDark,
  },
  modalBodyContent: {
    padding: 20,
  },
  modalArticleTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginTop: 12,
    marginBottom: 12,
  },
  modalAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalAuthorDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalExcerptBox: {
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalExcerptText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  modalBodyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 24,
    marginBottom: 20,
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
